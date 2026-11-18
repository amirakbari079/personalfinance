import { apiDelete, apiGet, apiGetList, apiPost, apiPut, apiRequest } from './apiClient'

export interface BizCategory {
  id: number
  name: string
  description: string | null
  createdAt: string
}

export interface BizCategoryRequest {
  name: string
  description?: string
}

export interface BizProduct {
  id: number
  code: string
  name: string
  unit: string
  categoryId: number | null
  categoryName: string | null
  defaultPurchasePrice: number | null
  defaultSalePrice: number | null
  minStockAlert: number | null
  isActive: boolean
  notes: string | null
  createdAt: string
}

export interface BizProductRequest {
  code: string
  name: string
  unit: string
  categoryId?: number | null
  defaultPurchasePrice?: number | null
  defaultSalePrice?: number | null
  minStockAlert?: number | null
  isActive?: boolean
  notes?: string
}

export interface BizCounterparty {
  id: number
  code: string
  name: string
  role: 'CUSTOMER' | 'SUPPLIER' | 'BOTH'
  phone: string | null
  isActive: boolean
  notes: string | null
  createdAt: string
}

export interface BizCounterpartyRequest {
  code: string
  name: string
  role: 'CUSTOMER' | 'SUPPLIER' | 'BOTH'
  phone?: string
  isActive?: boolean
  notes?: string
}

export interface BizAccount {
  id: number
  name: string
  type: 'CASH' | 'BANK' | 'WALLET' | 'PETTY_CASH'
  accountNumber: string | null
  openingBalance: number
  openingBalanceDate: string
  isActive: boolean
  notes: string | null
  createdAt: string
}

export interface BizAccountRequest {
  name: string
  type: 'CASH' | 'BANK' | 'WALLET' | 'PETTY_CASH'
  accountNumber?: string
  openingBalance: number
  openingBalanceDate?: string
  isActive?: boolean
  notes?: string
}

export interface BizSummary {
  period: string
  startDate: string
  endDate: string
  salesTotal: number
  grossProfit: number
  cashLiquidity: number
  receivables: number
  payables: number
  inventoryValue: number
  activeProductsCount: number
  activeCounterpartiesCount: number
  activeAccountsCount: number
  asOfDate: string
  calculationDefinitions: Record<string, string>
}

const BIZ_BASE = '/api/v1/business'

// Categories
export function getBizCategories(): Promise<BizCategory[]> {
  return apiGetList<BizCategory>(`${BIZ_BASE}/categories`, 'خطا در دریافت دسته‌بندی‌ها')
}

export function createBizCategory(data: BizCategoryRequest): Promise<BizCategory> {
  return apiPost<BizCategory>(`${BIZ_BASE}/categories`, data, 'خطا در ایجاد دسته‌بندی')
}

export function updateBizCategory(id: number, data: BizCategoryRequest): Promise<BizCategory> {
  return apiPut<BizCategory>(`${BIZ_BASE}/categories/${id}`, data, 'خطا در ویرایش دسته‌بندی')
}

export function deleteBizCategory(id: number): Promise<void> {
  return apiDelete(`${BIZ_BASE}/categories/${id}`, 'خطا در حذف دسته‌بندی')
}

// Products
export function getBizProducts(onlyActive = false): Promise<BizProduct[]> {
  return apiGetList<BizProduct>(
    `${BIZ_BASE}/products${onlyActive ? '?onlyActive=true' : ''}`,
    'خطا در دریافت لیست کالاها'
  )
}

export function createBizProduct(data: BizProductRequest): Promise<BizProduct> {
  return apiPost<BizProduct>(`${BIZ_BASE}/products`, data, 'خطا در ثبت کالا')
}

export function updateBizProduct(id: number, data: BizProductRequest): Promise<BizProduct> {
  return apiPut<BizProduct>(`${BIZ_BASE}/products/${id}`, data, 'خطا در ویرایش کالا')
}

export function toggleBizProductActive(id: number): Promise<BizProduct> {
  return apiRequest<BizProduct>(`${BIZ_BASE}/products/${id}/toggle-active`, {
    method: 'PATCH',
    errorMessage: 'خطا در تغییر وضعیت کالا',
  })
}

export function deleteBizProduct(id: number): Promise<void> {
  return apiDelete(`${BIZ_BASE}/products/${id}`, 'خطا در بایگانی کالا')
}

// Counterparties
export function getBizCounterparties(onlyActive = false, role?: string): Promise<BizCounterparty[]> {
  const params = new URLSearchParams()
  if (onlyActive) params.set('onlyActive', 'true')
  if (role) params.set('role', role)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return apiGetList<BizCounterparty>(`${BIZ_BASE}/counterparties${qs}`, 'خطا در دریافت طرف‌حساب‌ها')
}

export function createBizCounterparty(data: BizCounterpartyRequest): Promise<BizCounterparty> {
  return apiPost<BizCounterparty>(`${BIZ_BASE}/counterparties`, data, 'خطا در ثبت طرف‌حساب')
}

export function updateBizCounterparty(id: number, data: BizCounterpartyRequest): Promise<BizCounterparty> {
  return apiPut<BizCounterparty>(`${BIZ_BASE}/counterparties/${id}`, data, 'خطا در ویرایش طرف‌حساب')
}

export function toggleBizCounterpartyActive(id: number): Promise<BizCounterparty> {
  return apiRequest<BizCounterparty>(`${BIZ_BASE}/counterparties/${id}/toggle-active`, {
    method: 'PATCH',
    errorMessage: 'خطا در تغییر وضعیت طرف‌حساب',
  })
}

export function deleteBizCounterparty(id: number): Promise<void> {
  return apiDelete(`${BIZ_BASE}/counterparties/${id}`, 'خطا در بایگانی طرف‌حساب')
}

// Accounts
export function getBizAccounts(onlyActive = false): Promise<BizAccount[]> {
  return apiGetList<BizAccount>(
    `${BIZ_BASE}/accounts${onlyActive ? '?onlyActive=true' : ''}`,
    'خطا در دریافت حساب‌های کسب‌وکار'
  )
}

export function createBizAccount(data: BizAccountRequest): Promise<BizAccount> {
  return apiPost<BizAccount>(`${BIZ_BASE}/accounts`, data, 'خطا در ثبت حساب کسب‌وکار')
}

export function updateBizAccount(id: number, data: BizAccountRequest): Promise<BizAccount> {
  return apiPut<BizAccount>(`${BIZ_BASE}/accounts/${id}`, data, 'خطا در ویرایش حساب کسب‌وکار')
}

export function toggleBizAccountActive(id: number): Promise<BizAccount> {
  return apiRequest<BizAccount>(`${BIZ_BASE}/accounts/${id}/toggle-active`, {
    method: 'PATCH',
    errorMessage: 'خطا در تغییر وضعیت حساب',
  })
}

export function deleteBizAccount(id: number): Promise<void> {
  return apiDelete(`${BIZ_BASE}/accounts/${id}`, 'خطا در بایگانی حساب')
}

// Summary (Read-Only)
export function getBizSummary(startDate?: string, endDate?: string): Promise<BizSummary> {
  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return apiGet<BizSummary>(`${BIZ_BASE}/summary${qs}`, 'خطا در دریافت خلاصهٔ مالی فروشگاه')
}
