'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Archive,
  Download,
  FolderOpen,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react'
import FormModal from '@/shared/FormModal'
import {
  createBackup,
  deleteBackup,
  downloadBackup,
  getBackups,
  restoreBackup,
  uploadBackup,
  type BackupFile,
} from '@/lib/api/backupApi'

const TABLE_LABELS: Record<string, string> = {
  users: 'کاربران',
  accounts: 'حساب‌ها',
  investments: 'سرمایه‌گذاری‌ها',
  incomes: 'درآمدها',
  loans: 'وام‌ها',
  pending_expenses: 'هزینه‌های برنامه‌ریزی‌شده',
  receivables: 'طلب‌ها',
  standby: 'کالاهای معوق',
  value_snapshots: 'تاریخچه ارزش',
  balance_sheet_snapshots: 'تاریخچه ترازنامه',
  market_price_snapshots: 'قیمت بازار',
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} بایت`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} کیلوبایت`
  return `${(size / (1024 * 1024)).toFixed(1)} مگابایت`
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })
}

function countSummary(counts: Record<string, number>): string {
  return Object.entries(counts)
    .filter(([key, n]) => n > 0 && key !== 'users')
    .map(([key, n]) => `${TABLE_LABELS[key] ?? key}: ${n.toLocaleString('fa-IR')}`)
    .join(' · ')
}

export default function BackupPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [directory, setDirectory] = useState('')
  const [items, setItems] = useState<BackupFile[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pendingRestore, setPendingRestore] = useState<BackupFile | null>(null)

  async function load(silent = false) {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await getBackups()
      setDirectory(data.directory ?? '')
      setItems(data.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در دریافت فهرست بکاپ')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function run(action: () => Promise<void>, success: string, reload = true) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await action()
      setMessage(success)
      if (reload) await load(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'عملیات ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mb-10">
      <div className="flex items-start justify-between gap-3 mb-3 px-1">
        <div>
          <h2 className="text-xs text-text-muted flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5" />
            پشتیبان‌گیری
          </h2>
          {directory && (
            <p className="text-xs text-text-muted mt-1.5 flex items-start gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>ذخیره در پوشه backups داخل همین پروژه</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.currentTarget.value = ''
              if (!file) return
              void run(async () => {
                await uploadBackup(file)
              }, 'فایل بکاپ به پوشه اضافه شد')
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3 disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            انتخاب فایل
          </button>
          <button
            type="button"
            onClick={() => run(async () => {
              await createBackup()
            }, 'بکاپ جدید ذخیره شد')}
            disabled={busy}
            className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
          >
            تهیه بکاپ
          </button>
        </div>
      </div>

      <p className="text-xs text-text-muted mb-3 px-1">
        بکاپ شامل حساب‌ها، سرمایه‌گذاری‌ها، درآمد، وام، هزینه‌ها، طلب‌ها، کالاهای معوق و تاریخچه است.
        بازیابی همه داده‌های فعلی را جایگزین می‌کند.
      </p>

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-3">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-status-success bg-status-success-bg border border-status-success-border rounded-lg px-4 py-2.5 mb-3">
          {message}
        </p>
      )}

      <div className="glass-card p-4 space-y-3">
        {loading ? (
          <p className="text-sm text-text-muted px-1">در حال بارگذاری…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-muted px-1">
            هنوز بکاپی ذخیره نشده. یک بکاپ بگیرید تا بعد از نصب مجدد ویندوز هم قابل بازیابی باشد.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.filename}
              className="rounded-xl border border-surface-muted bg-surface-card/40 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-text-primary" dir="ltr">
                    {item.filename}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {formatWhen(item.createdAt)} · {formatBytes(item.sizeBytes)}
                  </p>
                  {countSummary(item.counts) && (
                    <p className="text-xs text-text-muted mt-1.5 leading-6">
                      {countSummary(item.counts)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    title="دانلود"
                    aria-label="دانلود"
                    disabled={busy}
                    onClick={() => void downloadBackup(item.filename).catch((e) => {
                      setError(e instanceof Error ? e.message : 'دانلود ناموفق بود')
                    })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-brand-accent hover:bg-surface-muted/60 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="بازیابی"
                    aria-label="بازیابی"
                    disabled={busy}
                    onClick={() => setPendingRestore(item)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-brand-accent hover:bg-surface-muted/60 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="حذف فایل"
                    aria-label="حذف فایل"
                    disabled={busy}
                    onClick={() => run(async () => {
                      await deleteBackup(item.filename)
                    }, 'فایل بکاپ حذف شد')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-status-error hover:bg-status-error-bg disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pendingRestore && (
        <FormModal
          title="بازیابی بکاپ"
          subtitle="همه داده‌های فعلی با محتوای این فایل جایگزین می‌شود."
          onClose={() => setPendingRestore(null)}
          footer={
            <div className="flex gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const name = pendingRestore.filename
                  setPendingRestore(null)
                  void run(async () => {
                    await restoreBackup(name)
                  }, 'داده‌ها بازیابی شد')
                }}
                className="flex-1 btn-primary py-2.5 disabled:opacity-50"
              >
                بازیابی
              </button>
              <button
                type="button"
                onClick={() => setPendingRestore(null)}
                className="btn-ghost"
              >
                انصراف
              </button>
            </div>
          }
        >
          <p className="text-sm text-text-primary leading-7" dir="ltr">
            {pendingRestore.filename}
          </p>
          <p className="text-xs text-text-muted mt-2">
            این کار قابل بازگشت نیست مگر بکاپ دیگری داشته باشید.
          </p>
        </FormModal>
      )}
    </section>
  )
}
