'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

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
    <div className="min-h-screen flex" dir="rtl">

      {/* پنل تاریک — فقط دسکتاپ */}
      <div className="hidden lg:flex lg:w-5/12 bg-brand-dark panel-texture flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-px h-full bg-brand-accent/30" />

        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-6 h-6 rounded-sm bg-brand-accent flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-text-on-accent/90" />
            </div>
            <span className="text-text-on-dark/50 text-xs tracking-widest uppercase font-light">
              Finance
            </span>
          </div>

          <h2 className="text-4xl font-light text-text-on-dark leading-tight">
            دارایی‌های شما
            <br />
            <span className="font-semibold text-brand-accent">یکجا</span>
          </h2>
          <p className="mt-5 text-sm text-text-on-dark/40 leading-loose max-w-[260px]">
            مدیریت کامل دارایی‌ها، درآمد، بدهی و ارزش خالص در یک محیط امن.
          </p>
        </div>

        <div className="space-y-1">
          <div className="w-8 h-px bg-brand-accent/50" />
          <p className="text-text-on-dark/25 text-xs pt-2 font-light">نسخه ۱ — شخصی</p>
        </div>
      </div>

      {/* پنل فرم */}
      <div className="flex-1 flex items-center justify-center bg-surface px-8 py-16">
        <div className="w-full max-w-[340px]">

          {/* لوگو موبایل */}
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <div className="w-6 h-6 rounded-sm bg-brand-accent flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-text-on-accent/90" />
            </div>
            <span className="text-text-primary font-semibold text-sm">حسابداری شخصی</span>
          </div>

          <div className="mb-9">
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">ورود به حساب</h1>
            <p className="mt-1.5 text-sm text-text-muted">اطلاعات کاربری خود را وارد کنید</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-text-primary mb-2 tracking-wide">
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
                className="
                  w-full bg-surface-card border border-surface-muted
                  rounded-lg px-4 py-3 text-sm text-text-primary
                  placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent
                  transition-all duration-150
                "
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-text-primary mb-2 tracking-wide">
                رمز عبور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="
                  w-full bg-surface-card border border-surface-muted
                  rounded-lg px-4 py-3 text-sm text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent
                  transition-all duration-150
                "
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full bg-brand-accent hover:bg-brand-accent-hover
                text-text-on-accent text-sm font-medium
                py-3 rounded-lg mt-1
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-surface
                disabled:opacity-50 disabled:cursor-not-allowed
              "
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
