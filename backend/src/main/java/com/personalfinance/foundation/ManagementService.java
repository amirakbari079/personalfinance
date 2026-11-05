package com.personalfinance.foundation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

/** Explicit allow-list: SQL identifiers never come from request input. */
@Service
public class ManagementService {
    record Resource(String table, List<String> fields, String active) {}
    private static final Map<String,Resource> RESOURCES=Map.of(
        "catalog",new Resource("pf_catalog",List.of("kind","code","name","metadata","active"),"active"),
        "assets",new Resource("fi_assets",List.of("symbol","name","name_en","asset_type","asset_category","country","currency","unit","market","is_tradable","is_active"),"is_active"),
        "providers",new Resource("fi_data_providers",List.of("code","name","reliability_score","is_active"),"is_active"),
        "routes",new Resource("fi_asset_source_routes",List.of("asset_id","provider_id","route_role","priority","quote_currency"),null)
    );
    public static final Set<String> KINDS=Set.of("ACCOUNT_TYPE","INCOME_CATEGORY","EXPENSE_CATEGORY","COUNTERPARTY","INSTITUTION","CURRENCY","UNIT");
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    public ManagementService(JdbcTemplate jdbc,ObjectMapper mapper) { this.jdbc=jdbc;this.mapper=mapper; }
    private Resource resource(String name) { var r=RESOURCES.get(name);if(r==null)throw new NoSuchElementException("بخش مدیریت یافت نشد");return r; }
    public List<Map<String,Object>> list(String name,String query,String kind,boolean all,int offset,int limit) {
        var r=resource(name); var args=new ArrayList<Object>();
        String sql="SELECT row_to_json(t)::text FROM "+r.table()+" t WHERE 1=1";
        if(!all && r.active()!=null) sql+=" AND "+r.active()+"=true";
        if(name.equals("catalog") && kind!=null && !kind.isBlank()) {sql+=" AND kind=?";args.add(kind);}
        if(query!=null && !query.isBlank()) {sql+=" AND (to_jsonb(t)::text ILIKE ?)";args.add("%"+query.trim()+"%");}
        sql+=" ORDER BY id LIMIT ? OFFSET ?";args.add(Math.max(1,Math.min(limit,200)));args.add(Math.max(0,offset));
        return jdbc.query(sql,(rs,n)->decode(rs.getString(1)),args.toArray());
    }
    public Map<String,Object> get(String name,long id) {
        var rows=jdbc.query("SELECT row_to_json(t)::text FROM "+resource(name).table()+" t WHERE id=?",(rs,n)->decode(rs.getString(1)),id);
        if(rows.isEmpty())throw new NoSuchElementException("رکورد یافت نشد");return rows.getFirst();
    }
    @Transactional public Map<String,Object> save(String name,Long id,Map<String,Object> body) {
        var r=resource(name);
        if(id==null && !body.keySet().containsAll(required(name))) throw new IllegalArgumentException("فیلدهای الزامی را تکمیل کنید");
        var fields=new ArrayList<String>();var args=new ArrayList<Object>();var slots=new ArrayList<String>();
        for(var key:body.keySet()) {
            if(key.equals("version"))continue;
            if(!r.fields().contains(key))throw new IllegalArgumentException("فیلد ناشناخته: "+key);
            Object v=body.get(key);
            if(v instanceof String s && s.length()>1000)throw new IllegalArgumentException("متن بیش از حد طولانی است");
            if(required(name).contains(key) && (v==null || v.toString().isBlank()))throw new IllegalArgumentException("فیلد الزامی خالی است: "+key);
            fields.add(key); slots.add(key.equals("metadata")?"?::jsonb":"?");args.add(key.equals("metadata")?encode(v):v);
        }
        if(fields.isEmpty())throw new IllegalArgumentException("تغییری ارسال نشده است");
        if(name.equals("catalog") && body.containsKey("kind") && !KINDS.contains(body.get("kind")))throw new IllegalArgumentException("نوع کاتالوگ معتبر نیست");
        if(name.equals("providers") && body.containsKey("code") && !Set.of("TGJU","NOBITEX","COINGECKO","TSETMC","DERIVED","WORLD_BANK","IMF","BLS").contains(body.get("code")))throw new IllegalArgumentException("اتصال این تأمین‌کننده پشتیبانی نمی‌شود");
        if(id==null) {
            id=jdbc.queryForObject("INSERT INTO "+r.table()+" ("+String.join(",",fields)+") VALUES ("+String.join(",",slots)+") RETURNING id",Long.class,args.toArray());
        } else {
            if(!(body.get("version") instanceof Number version))throw new IllegalArgumentException("نسخهٔ رکورد الزامی است");
            var assignments=new ArrayList<String>();for(int i=0;i<fields.size();i++)assignments.add(fields.get(i)+"="+slots.get(i));
            args.add(id);args.add(version.longValue());
            if(jdbc.update("UPDATE "+r.table()+" SET "+String.join(",",assignments)+" WHERE id=? AND version=?",args.toArray())!=1)throw new IllegalStateException("رکورد تغییر کرده است؛ دوباره بارگذاری کنید");
        }
        return get(name,id);
    }
    @Transactional public void deactivate(String name,long id,long version) {
        var r=resource(name);
        if(r.active()==null)throw new IllegalArgumentException("مسیر قیمت را ویرایش کنید؛ حذف سابقه مجاز نیست");
        if(jdbc.update("UPDATE "+r.table()+" SET "+r.active()+"=false WHERE id=? AND version=?",id,version)!=1)throw new IllegalStateException("رکورد تغییر کرده است");
    }
    private Set<String> required(String name) { return switch(name) {
        case "catalog" -> Set.of("kind","code","name"); case "providers" -> Set.of("code","name");
        case "assets" -> Set.of("symbol","name","asset_type","asset_category","currency","unit");
        case "routes" -> Set.of("asset_id","provider_id","route_role","priority","quote_currency");default -> Set.of();}; }
    public Map<String,Object> decode(String json) {try{return mapper.readValue(json,new TypeReference<>(){});}catch(Exception e){throw new IllegalStateException("دادهٔ ذخیره‌شده قابل خواندن نیست",e);} }
    public String encode(Object value) {try{return mapper.writeValueAsString(value);}catch(Exception e){throw new IllegalArgumentException("داده معتبر نیست",e);} }
}
