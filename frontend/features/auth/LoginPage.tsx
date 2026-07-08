'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import ThemeToggle from '@/shared/ThemeToggle'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.replace('/')
  }, [isAuthenticated, router])

  if (isAuthenticated) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(username, password)
      router.replace('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex relative" dir="rtl">
      <div className="absolute top-5 left-5 z-10">
        <ThemeToggle />
      </div>

      {/* پنل تاریک — دسکتاپ */}
      <div className="hidden lg:flex lg:w-5/12 bg-brand-dark panel-texture flex-col justify-between p-14 relative overflow-hidden border-l border-brand-accent/15">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-hover flex items-center justify-center shadow-gold">
              <div className="w-2.5 h-2.5 rounded-full bg-text-on-accent/90" />
            </div>
            <span className="text-section-label text-text-on-dark/40">
              Luxury Finance
            </span>
          </div>

          <h2 className="text-4xl text-page-title text-text-on-dark leading-tight">
            دارایی‌های شما
            <br />
            <span className="text-brand-accent" style={{ fontWeight: 'var(--font-weight-body)' }}>یکجا</span>
          </h2>
          <p className="mt-5 text-sm text-text-on-dark/35 leading-loose max-w-[280px]" style={{ fontWeight: 'var(--font-weight-caption)' }}>
            مدیریت کامل دارایی‌ها، درآمد، بدهی و ارزش خالص در محیطی امن و لوکس.
          </p>
        </div>

        <div className="relative space-y-2">
          <div className="gold-line w-12" />
          <p className="text-text-on-dark/20 text-xs pt-2 tracking-wide" style={{ fontWeight: 'var(--font-weight-caption)' }}>نسخه ۱ — شخصی</p>
        </div>
      </div>

      {/* پنل فرم */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[360px]">
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-hover flex items-center justify-center shadow-gold">
              <div className="w-2.5 h-2.5 rounded-full bg-text-on-accent/90" />
            </div>
            <span className="text-text-primary text-sm" style={{ fontWeight: 'var(--font-weight-heading)' }}>حسابداری شخصی</span>
          </div>

          <div className="mb-9">
            <p className="text-[10px] tracking-[0.25em] uppercase text-brand-accent/70 mb-2 text-section-label">Welcome</p>
            <h1 className="text-2xl text-page-title text-text-primary tracking-tight">ورود به حساب</h1>
            <p className="mt-2 text-sm text-text-muted">اطلاعات کاربری خود را وارد کنید</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="username" className="field-label mb-2 tracking-wide">
                نام کاربری
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="field-label mb-2 tracking-wide">
                رمز عبور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="field-input"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-text-on-accent/30 border-t-text-on-accent rounded-full animate-spin" />
                  در حال ورود...
                </span>
              ) : 'ورود'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
