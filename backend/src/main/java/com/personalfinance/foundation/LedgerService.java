package com.personalfinance.foundation;

import com.personalfinance.balance.service.BalanceSheetService;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.service.ValueSnapshotService;
import jakarta.persistence.EntityManager;
import jakarta.validation.constraints.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class LedgerService {
 public record Command(@NotNull UUID requestKey,@NotBlank String kind,@NotNull Long accountId,Long destinationAccountId,
  @NotNull @Positive @Max(9007199254740991L) Long amount,@NotNull LocalDate date,@NotBlank @Size(max=1000) String description,
  Long categoryId,Long counterpartyId,@NotNull Long expectedVersion) {}
 private final JdbcTemplate jdbc; private final ManagementService json;
 private final ValueSnapshotService snapshots;private final BalanceSheetService balances;private final EntityManager em;
 public LedgerService(JdbcTemplate jdbc,ManagementService json,ValueSnapshotService snapshots,BalanceSheetService balances,EntityManager em){this.jdbc=jdbc;this.json=json;this.snapshots=snapshots;this.balances=balances;this.em=em;}
 public static LocalDate today(){return LocalDate.now(ZoneId.of("Asia/Tehran"));}

 @Transactional public void open(long accountId,long amount,LocalDate date) {
  jdbc.update("INSERT INTO pf_ledger_accounts(account_id,opening_date,opening_balance) VALUES(?,?,?) ON CONFLICT DO NOTHING",accountId,date,amount);
 }
 @Transactional public Map<String,Object> post(Command c) {
  if(!Set.of("INCOME","EXPENSE","TRANSFER","ADJUSTMENT").contains(c.kind()))throw new IllegalArgumentException("نوع تراکنش معتبر نیست");
  if(c.requestKey()==null || c.accountId()==null || c.amount()==null || c.amount()<=0 || c.amount()>9007199254740991L || c.date()==null || c.description()==null || c.description().isBlank())throw new IllegalArgumentException("اطلاعات تراکنش کامل نیست");
  if(c.kind().equals("ADJUSTMENT"))throw new IllegalArgumentException("برای اصلاح موجودی از مسیر اختصاصی استفاده کنید");
  String hash=hash(c); lockRequest(c.requestKey());
  var previous=existing(c.requestKey(),hash);if(previous!=null)return previous;
  if(c.expectedVersion()==null)throw new IllegalArgumentException("نسخهٔ حساب الزامی است");
  var ids=new TreeSet<Long>();ids.add(c.accountId());
  if(c.kind().equals("TRANSFER")) {
   if(c.destinationAccountId()==null || c.accountId().equals(c.destinationAccountId()))throw new IllegalArgumentException("حساب مقصد باید متفاوت باشد");
   ids.add(c.destinationAccountId());
  } else if(c.destinationAccountId()!=null)throw new IllegalArgumentException("حساب مقصد فقط برای انتقال است");
  for(long id:ids)lockAccount(id,c.date(),id==c.accountId()?c.expectedVersion():null);
  validateCatalog(c.categoryId(),c.kind().equals("INCOME")?"INCOME_CATEGORY":"EXPENSE_CATEGORY");validateCatalog(c.counterpartyId(),"COUNTERPARTY");
  long id=insert(c.requestKey(),hash,c.kind(),c.date(),c.description(),c.categoryId(),c.counterpartyId(),null);
  entry(id,c.accountId(),c.kind().equals("INCOME")?c.amount():-c.amount());
  if(c.kind().equals("TRANSFER"))entry(id,c.destinationAccountId(),c.amount());
  refresh(ids);return get(id);
 }
 public record Adjustment(@NotNull UUID requestKey,@NotNull Long accountId,@NotNull Long balance,@NotNull LocalDate date,@NotBlank String reason,@NotNull Long expectedVersion) {}
 @Transactional public Map<String,Object> adjust(Adjustment c) {
  if(c.accountId()==null || c.expectedVersion()==null || c.date()==null)throw new IllegalArgumentException("اطلاعات اصلاح کامل نیست");
  if(c.balance()==null || c.balance()>9007199254740991L || c.balance() < -9007199254740991L || c.reason()==null || c.reason().isBlank() || c.reason().length()>1000)throw new IllegalArgumentException("مبلغ و دلیل اصلاح معتبر نیست");
  String hash=hash(c);lockRequest(c.requestKey());var previous=existing(c.requestKey(),hash);if(previous!=null)return previous;
  lockAccount(c.accountId(),c.date(),c.expectedVersion());
  // Corrections reconcile today's balance. Backdated transactions remain separately auditable.
  if(!today().equals(c.date()))throw new IllegalArgumentException("اصلاح موجودی باید برای امروز باشد");
  long current=jdbc.queryForObject("SELECT balance FROM accounts WHERE id=?",Long.class,c.accountId());
  long delta=Math.subtractExact(c.balance(),current);if(delta==0)throw new IllegalArgumentException("موجودی تغییری نکرده است");
  long id=insert(c.requestKey(),hash,"ADJUSTMENT",c.date(),c.reason(),null,null,null);
  entry(id,c.accountId(),delta);refresh(Set.of(c.accountId()));return get(id);
 }
 public record Reversal(@NotNull UUID requestKey,@NotBlank @Size(max=1000) String reason) {}
 @Transactional public Map<String,Object> reverse(long original,Reversal c) {
  if(c.reason()==null || c.reason().isBlank() || c.reason().length()>1000)throw new IllegalArgumentException("دلیل ابطال الزامی است");
  String hash=hash(Map.of("original",original,"request",c));lockRequest(c.requestKey());var prior=existing(c.requestKey(),hash);if(prior!=null)return prior;
  var record=jdbc.queryForList("SELECT * FROM pf_transactions WHERE id=? FOR UPDATE",original);
  if(record.isEmpty())throw new NoSuchElementException("تراکنش یافت نشد");
  if("REVERSAL".equals(record.getFirst().get("kind")))throw new IllegalArgumentException("ابطال را نمی‌توان دوباره ابطال کرد");
  if(record.getFirst().get("related_type")!=null)throw new IllegalArgumentException("ابطال از صفحهٔ عملیات مرتبط انجام می‌شود");
  if(jdbc.queryForObject("SELECT count(*) FROM pf_transactions WHERE reversal_of=?",Long.class,original)>0)throw new IllegalStateException("تراکنش قبلاً ابطال شده است");
  var rows=jdbc.queryForList("SELECT account_id,amount FROM pf_transaction_entries WHERE transaction_id=? ORDER BY account_id",original);
  var ids=new TreeSet<Long>();for(var row:rows){long a=((Number)row.get("account_id")).longValue();ids.add(a);lockAccount(a,today(),null);}
  long id=insert(c.requestKey(),hash,"REVERSAL",today(),c.reason(),null,null,original);
  for(var row:rows)entry(id,((Number)row.get("account_id")).longValue(),Math.negateExact(((Number)row.get("amount")).longValue()));
  refresh(ids);return get(id);
 }
 public List<Map<String,Object>> list(Long accountId,LocalDate from,LocalDate to,String query,int offset,int limit) {
  String sql="SELECT t.id FROM pf_transactions t WHERE 1=1";var args=new ArrayList<Object>();
  if(accountId!=null){sql+=" AND EXISTS(SELECT 1 FROM pf_transaction_entries e WHERE e.transaction_id=t.id AND e.account_id=?)";args.add(accountId);}
  if(from!=null){sql+=" AND t.effective_date>=?";args.add(from);}if(to!=null){sql+=" AND t.effective_date<=?";args.add(to);}
  if(query!=null&&!query.isBlank()){sql+=" AND t.description ILIKE ?";args.add("%"+query+"%");}
  sql+=" ORDER BY t.effective_date DESC,t.id DESC LIMIT ? OFFSET ?";args.add(Math.max(1,Math.min(limit,200)));args.add(Math.max(0,offset));
  return jdbc.queryForList(sql,Long.class,args.toArray()).stream().map(this::get).toList();
 }
 public Map<String,Object> get(long id) {
  var rows=jdbc.query("SELECT row_to_json(t)::text FROM pf_transactions t WHERE id=?",(rs,n)->json.decode(rs.getString(1)),id);
  if(rows.isEmpty())throw new NoSuchElementException("تراکنش یافت نشد");var result=rows.getFirst();
  result.put("entries",jdbc.queryForList("SELECT e.account_id,a.name AS account_name,e.amount::text AS amount FROM pf_transaction_entries e JOIN accounts a ON a.id=e.account_id WHERE transaction_id=? ORDER BY e.id",id));
  result.put("reversed",jdbc.queryForObject("SELECT count(*)>0 FROM pf_transactions WHERE reversal_of=?",Boolean.class,id));return result;
 }
 public List<Map<String,Object>> accounts(){return jdbc.queryForList("SELECT a.id,a.name,a.balance::text AS balance,a.version,l.opening_date,l.opening_balance::text AS opening_balance FROM accounts a JOIN pf_ledger_accounts l ON l.account_id=a.id WHERE a.archived_at IS NULL ORDER BY a.name");}
 public Map<String,Object> summary(LocalDate from,LocalDate to){
  if(from==null || to==null || from.isAfter(to))throw new IllegalArgumentException("بازهٔ تاریخ معتبر نیست");
  return jdbc.queryForMap("""
    SELECT coalesce(sum(CASE WHEN coalesce(original.kind,t.kind)='INCOME' THEN e.amount ELSE 0 END),0)::text AS income,
      coalesce(sum(CASE WHEN coalesce(original.kind,t.kind)='EXPENSE' THEN -e.amount ELSE 0 END),0)::text AS expense
    FROM pf_transactions t JOIN pf_transaction_entries e ON e.transaction_id=t.id
    LEFT JOIN pf_transactions original ON original.id=t.reversal_of
    WHERE t.effective_date BETWEEN ? AND ?
    """,from,to);
 }
 private void validateCatalog(Long id,String kind){if(id!=null&&jdbc.queryForObject("SELECT count(*) FROM pf_catalog WHERE id=? AND kind=? AND active=true",Long.class,id,kind)!=1)throw new IllegalArgumentException("دسته یا طرف حساب معتبر نیست");}
 private void lockRequest(UUID key){if(key==null)throw new IllegalArgumentException("شناسه درخواست الزامی است");jdbc.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?,0))::text",String.class,key.toString());}
 private Map<String,Object> existing(UUID key,String hash){var rows=jdbc.queryForList("SELECT id,request_hash FROM pf_transactions WHERE request_key=?",key);if(rows.isEmpty())return null;if(!hash.equals(rows.getFirst().get("request_hash")))throw new IllegalStateException("شناسه درخواست برای اطلاعات دیگری استفاده شده است");return get(((Number)rows.getFirst().get("id")).longValue());}
 private void lockAccount(long id,LocalDate date,Long expectedVersion){
  if(date==null||date.isAfter(today()))throw new IllegalArgumentException("تراکنش آینده را در برنامهٔ پرداخت ثبت کنید");
  var rows=jdbc.queryForList("SELECT a.version,l.opening_date FROM accounts a JOIN pf_ledger_accounts l ON l.account_id=a.id WHERE a.id=? AND a.archived_at IS NULL FOR UPDATE OF a",id);
  if(rows.isEmpty())throw new NoSuchElementException("حساب فعال یافت نشد");var row=rows.getFirst();
  if(date.isBefore(((java.sql.Date)row.get("opening_date")).toLocalDate()))throw new IllegalArgumentException("تاریخ قبل از ماندهٔ افتتاحیه است");
  if(expectedVersion!=null&&expectedVersion.longValue()!=((Number)row.get("version")).longValue())throw new IllegalStateException("موجودی حساب تغییر کرده است؛ دوباره بررسی کنید");
 }
 private long insert(UUID key,String hash,String kind,LocalDate date,String description,Long category,Long counterparty,Long reversal){return jdbc.queryForObject("INSERT INTO pf_transactions(request_key,request_hash,kind,effective_date,description,category_id,counterparty_id,reversal_of) VALUES(?,?,?,?,?,?,?,?) RETURNING id",Long.class,key,hash,kind,date,description,category,counterparty,reversal);}
 private void entry(long transaction,long account,long amount){jdbc.update("INSERT INTO pf_transaction_entries(transaction_id,account_id,amount) VALUES(?,?,?)",transaction,account,amount);}
 private void refresh(Collection<Long> ids){
  for(long id:ids){
   long value=jdbc.queryForObject("SELECT l.opening_balance+coalesce((SELECT sum(amount) FROM pf_transaction_entries WHERE account_id=l.account_id),0) FROM pf_ledger_accounts l WHERE l.account_id=?",Long.class,id);
   if(value>9007199254740991L||value < -9007199254740991L)throw new IllegalArgumentException("موجودی خارج از محدودهٔ پشتیبانی‌شده است");
   jdbc.update("UPDATE accounts SET balance=? WHERE id=?",value,id);
   // Legacy snapshots are immutable evidence. Ledger history is derived from entries.
  }
  em.flush();em.clear();balances.recordTodaySnapshot();
 }
 private String hash(Object data){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(json.encode(data).getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalArgumentException("درخواست قابل پردازش نیست",e);}}
}
