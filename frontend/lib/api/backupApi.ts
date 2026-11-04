import { apiDelete, apiGet, apiRequest } from './apiClient'
import { downloadCsv } from '@/lib/csvExport'

export interface BackupFile {
  filename: string
  createdAt: string
  sizeBytes: number
  counts: Record<string, number>
}

export interface BackupList {
  directory: string
  items: BackupFile[]
}

export interface RestoreResult {
  filename: string
  restoredCounts: Record<string, number>
}

const BASE = '/api/v1/backups'

export function getBackups(): Promise<BackupList> {
  return apiGet<BackupList>(BASE, 'خطا در دریافت فهرست بکاپ')
}

export function createBackup(): Promise<BackupFile> {
  return apiRequest<BackupFile>(BASE, {
    method: 'POST',
    errorMessage: 'خطا در ساخت بکاپ',
  })
}

export function restoreBackup(name: string): Promise<RestoreResult> {
  return apiRequest<RestoreResult>(`${BASE}/restore?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    errorMessage: 'بازیابی بکاپ ناموفق بود',
  })
}

export function deleteBackup(name: string): Promise<void> {
  return apiDelete(`${BASE}/file?name=${encodeURIComponent(name)}`, 'حذف بکاپ ناموفق بود')
}

export function uploadBackup(file: File): Promise<BackupFile> {
  const form = new FormData()
  form.append('file', file)
  return apiRequest<BackupFile>(`${BASE}/upload`, {
    method: 'POST',
    body: form,
    errorMessage: 'آپلود فایل بکاپ ناموفق بود',
  })
}

export function downloadBackup(name: string): Promise<void> {
  return downloadCsv(`${BASE}/file?name=${encodeURIComponent(name)}`, name)
}
