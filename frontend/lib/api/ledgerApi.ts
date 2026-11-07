import { apiGet, apiGetList, apiPost } from './apiClient'
export interface LedgerAccount { id: number; name: string; balance: string; version: number; opening_date: string; opening_balance: string }
export interface LedgerEntry { account_id: number; account_name: string; amount: string }
export interface LedgerTransaction {
  id: number; kind: string; effective_date: string; description: string; created_at: string;
  reversed: boolean; reversal_of: number | null; related_type: string | null; entries: LedgerEntry[]
}
export interface CatalogItem { id: number; kind: string; name: string; code: string; version: number; active: boolean; metadata: Record<string, unknown> }
export const ledgerLabels: Record<string, string> = {
  INCOME: 'دریافت', EXPENSE: 'پرداخت', TRANSFER: 'انتقال', ADJUSTMENT: 'اصلاح موجودی', REVERSAL: 'ابطال',
  LOAN_PAYMENT: 'قسط وام', RECEIVABLE_PAYMENT: 'وصول طلب', PLANNED_PAYMENT: 'پرداخت برنامه', GOODS_SALE: 'فروش کالا',
  INVESTMENT_BUY: 'خرید دارایی', INVESTMENT_SELL: 'فروش دارایی',
}
const base = '/api/v1/ledger'
export const getLedgerAccounts = () => apiGetList<LedgerAccount>(`${base}/accounts`, 'دریافت حساب‌ها ناموفق بود')
export const getTransactions = (params: URLSearchParams) => apiGetList<LedgerTransaction>(`${base}/transactions?${params}`, 'دریافت تراکنش‌ها ناموفق بود')
export const getLedgerSummary = (from: string, to: string) => apiGet<{ income: string; expense: string }>(`${base}/summary?from=${from}&to=${to}`, 'دریافت خلاصه ناموفق بود')
export const getCatalog = (kind?: string) => apiGetList<CatalogItem>(`/api/v1/management/catalog?limit=200${kind ? `&kind=${kind}` : ''}`, 'دریافت دسته‌ها ناموفق بود')
export const postTransaction = (data: unknown, adjustment = false) => apiPost<LedgerTransaction>(`${base}/${adjustment ? 'adjustments' : 'transactions'}`, data, 'ثبت تراکنش ناموفق بود')
export const reverseTransaction = (id: number, requestKey: string, reason: string) => apiPost<LedgerTransaction>(`${base}/transactions/${id}/reverse`, { requestKey, reason }, 'ابطال تراکنش ناموفق بود')
export function todayIso() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) }
export function displayDate(iso: string) { return new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', dateStyle: 'medium' }).format(new Date(`${iso.slice(0, 10)}T12:00:00+03:30`)) }
