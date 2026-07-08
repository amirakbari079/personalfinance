import { ApiSmokeTest } from '../ApiSmokeTest'
import { AuthSmokeTest } from '../AuthSmokeTest'

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-56px)]">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-text-primary">حسابداری شخصی</h1>
        <p className="mt-2 text-sm text-text-muted">Next.js migration — step 7</p>
        <div className="mt-6 w-8 h-px bg-brand-accent/40 mx-auto" />
        <AuthSmokeTest />
        <ApiSmokeTest />
      </div>
    </div>
  )
}
