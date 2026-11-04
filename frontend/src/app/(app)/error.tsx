'use client'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="max-w-lg mx-auto p-6 space-y-4" role="alert">
    <h1 className="text-xl font-bold">صفحه باز نشد</h1>
    <p>اطلاعات ذخیره‌شده حفظ شده‌اند. دوباره تلاش کنید.</p>
    <button type="button" className="btn-primary" onClick={reset}>تلاش دوباره</button>
  </section>
}
