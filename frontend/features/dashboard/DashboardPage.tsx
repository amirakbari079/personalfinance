'use client'
import Link from 'next/link'
import {
  Wallet,
  TrendingUp,
  Landmark,
  ArrowUpLeft,
  CalendarDays,
  RefreshCw,
  ChartNoAxesCombined,
  Scale,
} from 'lucide-react'
import { useBalanceSheetData } from '@/features/balance-sheet/useBalanceSheetData'
import { useDashboardExtras } from './useDashboardExtras'
import { compactMoney } from './analytics'
import { formatToman } from '@/utils/formatToman'
import FinanceIllustration from '@/shared/FinanceIllustration'
import TrendExplorer from './TrendExplorer'
import AllocationPanel from './AllocationPanel'
import AssetExplorer from './AssetExplorer'
import { MonthlyPlan, UpcomingPayments } from './PlanningPanels'
export default function DashboardPage({
  reports = false,
}: {
  reports?: boolean
}) {
  const { data, isLoading, error } = useBalanceSheetData()
  const extras = useDashboardExtras()
  const today = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Tehran',
  }).format(new Date())
  if (isLoading)
    return (
      <div
        className="dashboard-page"
        role="status"
        aria-label="در حال دریافت تصویر مالی"
      >
        <div className="dashboard-skeleton hero-skeleton" />
        <div className="metric-grid">
          {[1, 2, 3].map((i) => (
            <div className="dashboard-skeleton" key={i} />
          ))}
        </div>
        <div className="dashboard-skeleton chart-skeleton" />
      </div>
    )
  if (error || !data)
    return (
      <div className="dashboard-page">
        <div className="finance-panel calm-empty" role="alert">
          <RefreshCw size={32} />
          <h1>تصویر مالی دریافت نشد</h1>
          <p>{error ?? 'اتصال به برنامه را بررسی کنید.'}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            تلاش دوباره
          </button>
        </div>
      </div>
    )
  const cash = data.assets
    .filter((a) => a.category === 'cash')
    .reduce((s, a) => s + a.amount, 0)
  const invested = data.assets
    .filter((a) => a.category === 'investment')
    .reduce((s, a) => s + a.amount, 0)
  const paid = extras.loans.reduce((s, l) => s + l.paidAmount, 0)
  const remaining = extras.loans.reduce((s, l) => s + l.remainingAmount, 0)
  const debtProgress =
    paid + remaining > 0 ? (paid / (paid + remaining)) * 100 : 0
  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">
            {reports ? 'از عددها به شناخت بهتر' : 'امروز، با خیال روشن‌تر'}
          </p>
          <h1>{reports ? 'تحلیل و مقایسه' : 'تصویر مالی شما'}</h1>
          <p>
            {reports
              ? 'روندها را ببینید، ترکیب دارایی را بشناسید و برنامهٔ ماه را مقایسه کنید.'
              : 'دارایی‌ها، تعهدات و قدم بعدی؛ همه در یک نگاه.'}
          </p>
        </div>
        <span className="date-label">
          <CalendarDays size={17} />
          {today}
        </span>
      </div>
      {!reports && (
        <section className="wealth-hero">
          <div className="hero-content">
            <span className="hero-kicker">
              <span /> بر پایهٔ اطلاعات ثبت‌شدهٔ شما
            </span>
            <h2>تراز خالص دارایی و تعهدات</h2>
            <p className="hero-amount">
              <bdi>{data.netBalance.toLocaleString('fa-IR')}</bdi>
              <span>تومان</span>
            </p>
            <p className="hero-description">
              دارایی‌ها منهای ماندهٔ وام‌ها و همهٔ هزینه‌های برنامه‌ریزی‌شده
            </p>
            <div className="hero-bottom">
              <div>
                <small>کل دارایی‌ها</small>
                <strong>{compactMoney(data.totalAssets)} تومان</strong>
              </div>
              <div>
                <small>کل تعهدات</small>
                <strong>{compactMoney(data.totalLiabilities)} تومان</strong>
              </div>
              <Link href="/balance-sheet">
                جزئیات ترازنامه <ArrowUpLeft size={18} />
              </Link>
            </div>
          </div>
          <FinanceIllustration />
        </section>
      )}
      <div className="metric-grid">
        {[
          {
            label: 'موجودی نقدی',
            value: cash,
            hint: 'مجموع حساب‌ها و کیف پول‌ها',
            href: '/accounts',
            Icon: Wallet,
            color: 'green',
          },
          {
            label: 'سرمایه‌گذاری‌ها',
            value: invested,
            hint: 'آخرین ارزش ثبت‌شده',
            href: '/investments',
            Icon: TrendingUp,
            color: 'gold',
          },
          {
            label: 'تعهدات ثبت‌شده',
            value: data.totalLiabilities,
            hint: 'وام باقی‌مانده و هزینه‌های آینده',
            href: '/balance-sheet',
            Icon: Landmark,
            color: 'coral',
          },
        ].map(({ label, value, hint, href, Icon, color }) => (
          <Link
            className={`metric-card metric-${color}`}
            href={href}
            key={label}
          >
            <div>
              <span className="finance-icon">
                <Icon size={22} />
              </span>
              <ArrowUpLeft size={17} className="muted" />
            </div>
            <p>{label}</p>
            <strong title={formatToman(value)}>
              {compactMoney(value)} <small>تومان</small>
            </strong>
            <span className="metric-hint">{hint}</span>
          </Link>
        ))}
      </div>
      <div className="dashboard-charts">
        <TrendExplorer
          history={extras.history}
          loading={extras.loading}
          error={extras.errors.includes('تاریخچه')}
          retry={extras.retry}
          expanded={reports}
        />
        <AllocationPanel assets={data.assets} />
      </div>
      {extras.errors.some((e) => e !== 'تاریخچه') ? (
        <div className="finance-panel inline-notice" role="alert">
          اطلاعات {extras.errors.filter((e) => e !== 'تاریخچه').join('، ')}{' '}
          دریافت نشد.{' '}
          <button className="btn-ghost" onClick={extras.retry}>
            تلاش دوباره
          </button>
        </div>
      ) : extras.loading ? (
        <div className="chart-skeleton" />
      ) : (
        <div className="dashboard-bottom">
          <MonthlyPlan
            incomes={extras.incomes}
            loans={extras.loans}
            expenses={extras.expenses}
          />
          <UpcomingPayments loans={extras.loans} expenses={extras.expenses} />
        </div>
      )}
      <AssetExplorer data={data} />
      {reports && !extras.loading && !extras.errors.includes('وام‌ها') && (
        <section className="finance-panel debt-panel">
          <div className="finance-icon">
            <Scale size={26} />
          </div>
          <div>
            <p className="eyebrow">قدم‌به‌قدم تا تسویه</p>
            <h2>مسیر بازپرداخت وام‌ها</h2>
            <p>
              {paid + remaining > 0
                ? `${debtProgress.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪ از مبلغ اقساط ثبت‌شده پرداخت شده است.`
                : 'برای نمایش پیشرفت، یک وام ثبت کنید.'}
            </p>
            <div className="plan-track">
              <span
                style={{
                  width: `${debtProgress}%`,
                  background: 'var(--finance-chart-1)',
                }}
              />
            </div>
          </div>
          <Link href="/loans" className="btn-secondary">
            بررسی اقساط <ArrowUpLeft size={16} />
          </Link>
        </section>
      )}
      {!reports && (
        <Link href="/reports" className="insight-banner">
          <span className="finance-icon">
            <ChartNoAxesCombined size={24} />
          </span>
          <span>
            <strong>پشت این عددها چه خبر است؟</strong>
            <small>
              مقایسهٔ دارایی و تعهدات، روند ثبت‌ها و پیشرفت بازپرداخت
            </small>
          </span>
          <ArrowUpLeft size={24} />
        </Link>
      )}
    </div>
  )
}
