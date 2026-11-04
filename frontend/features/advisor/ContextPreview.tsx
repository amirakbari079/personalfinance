'use client'

import MarketRefreshButton from '@/shared/market/MarketRefreshButton'
import { formatChange, formatPrice, formatStatus } from '@/features/intelligence/format'
import { formatWhen } from './format'
import type { AdvisorContext } from './api'
import type { IntelligenceAsset } from '@/features/intelligence/api'

interface Props {
  context: AdvisorContext | null
  loading: boolean
  refreshing: boolean
  symbols: string[]
  catalog: IntelligenceAsset[]
  onToggleSymbol: (symbol: string) => void
  onRefresh: () => void
}

export default function ContextPreview({
  context,
  loading,
  refreshing,
  symbols,
  catalog,
  onToggleSymbol,
  onRefresh,
}: Props) {
  const stale = context?.freshness?.marketStale === true
  const conflicts = (context?.openConflictCount ?? 0) > 0

  return (
    <section className="glass-card p-4 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base text-text-primary">پیش‌نمایش داده پیش‌زمینه</h2>
          <p className="text-xs text-text-muted mt-1">
            قبل از تحلیل، قیمت، تاریخ مشاهده و شاخص کلان را همین‌جا بررسی کنید.
          </p>
        </div>
        <MarketRefreshButton onClick={onRefresh} loading={refreshing} label="بروزرسانی بازار" />
      </div>

      {loading && !context ? (
        <p className="text-sm text-text-muted">در حال خواندن اسنپ‌شات بازار…</p>
      ) : !context ? (
        <p className="text-sm text-text-muted">هنوز پیش‌نمایشی آماده نشده است.</p>
      ) : (
        <>
          <div
            className={`rounded-xl px-3 py-2 mb-4 text-sm ${
              stale
                ? 'bg-status-error-bg text-status-error border border-status-error-border'
                : 'bg-status-success-bg text-status-success border border-status-success-border'
            }`}
          >
            {stale
              ? context.freshness?.staleReason ?? 'داده پیش‌زمینه ممکن است کهنه باشد'
              : 'اسنپ‌شات فعلی برای تحلیل قابل استفاده است'}
            {conflicts && !stale ? ' · تعارض باز بین منابع ثبت شده' : ''}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Meta label="اسنپ‌شات" value={context.marketSnapshotId != null ? `#${context.marketSnapshotId}` : '—'} />
            <Meta label="زمان اسنپ‌شات" value={formatWhen(context.snapshotCapturedAt)} />
            <Meta
              label="آخرین جاب"
              value={
                context.freshness?.lastUpdateStatus
                  ? formatStatus(context.freshness.lastUpdateStatus)
                  : '—'
              }
            />
            <Meta
              label="تعارض باز"
              value={(context.openConflictCount ?? 0).toLocaleString('fa-IR')}
            />
          </div>

          {(context.premiums?.usdtPremiumPercent != null || context.premiums?.paxgPremiumPercent != null) && (
            <p className="text-xs text-text-muted mb-3">
              پریمیوم تتر {formatChange(context.premiums.usdtPremiumPercent)} · پریمیوم PAXG{' '}
              {formatChange(context.premiums.paxgPremiumPercent)}
            </p>
          )}

          <p className="text-xs text-text-muted mb-2">دارایی‌های مقایسه‌ای بازار</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(
              catalog.length > 0 ? catalog : symbols.map((symbol) => ({ symbol, name: symbol }))
            ).map((asset) => {
              const active = symbols.includes(asset.symbol)
              return (
                <button
                  key={asset.symbol}
                  type="button"
                  onClick={() => onToggleSymbol(asset.symbol)}
                  className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                    active
                      ? 'border-brand-accent bg-brand-accent/15 text-text-primary'
                      : 'border-surface-muted/50 text-text-muted'
                  }`}
                >
                  {asset.name}
                </button>
              )
            })}
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs border-b border-surface-muted/40">
                  <th className="text-right font-normal p-2">دارایی</th>
                  <th className="text-right font-normal p-2">قیمت</th>
                  <th className="text-right font-normal p-2">مشاهده</th>
                  <th className="text-right font-normal p-2">۳۰ روز</th>
                  <th className="text-right font-normal p-2">یک سال</th>
                  <th className="text-right font-normal p-2">منبع</th>
                </tr>
              </thead>
              <tbody>
                {context.assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-3 text-text-muted">
                      برای این نمادها قیمتی در کاتالوگ نیست.
                    </td>
                  </tr>
                ) : (
                  context.assets.map((asset) => (
                    <tr key={asset.symbol} className="border-b border-surface-muted/30 last:border-0">
                      <td className="p-2">
                        <div className="text-text-primary">{asset.name}</div>
                        <div className="text-[11px] text-text-muted" dir="ltr">
                          {asset.symbol}
                          {asset.stale ? ' · کهنه' : ''}
                        </div>
                      </td>
                      <td className="p-2 tabular-nums">{formatPrice(asset.latestPrice, asset.currency)}</td>
                      <td className="p-2 whitespace-nowrap">{formatWhen(asset.observedAt)}</td>
                      <td className="p-2">{formatChange(asset.return30d)}</td>
                      <td className="p-2">{formatChange(asset.return1y)}</td>
                      <td className="p-2">{asset.providerCode ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {context.macro.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted text-xs border-b border-surface-muted/40">
                    <th className="text-right font-normal p-2">شاخص کلان</th>
                    <th className="text-right font-normal p-2">دوره</th>
                    <th className="text-right font-normal p-2">مقدار</th>
                    <th className="text-right font-normal p-2">منبع</th>
                  </tr>
                </thead>
                <tbody>
                  {context.macro.map((row) => (
                    <tr key={row.code} className="border-b border-surface-muted/30 last:border-0">
                      <td className="p-2 text-text-primary">{row.name}</td>
                      <td className={`p-2 ${row.stale ? 'text-status-error' : ''}`} dir="ltr">
                        {row.period}
                      </td>
                      <td className="p-2 tabular-nums">
                        {row.value.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}
                        {row.unit ? ` ${row.unit}` : ''}
                      </td>
                      <td className="p-2">{row.source ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-muted/20 px-3 py-2">
      <p className="text-[11px] text-text-muted mb-1">{label}</p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  )
}
