import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './views/auth/LoginPage'
import AccountsPage from './views/accounts/AccountsPage'
import InvestmentsPage from './views/investments/InvestmentsPage'
import IncomePage from './views/income/IncomePage'
import LoansPage from './views/loans/LoansPage'
import PendingExpensesPage from './views/pendingExpenses/PendingExpensesPage'

function AppShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top nav */}
      <header className="bg-surface-card border-b border-surface-muted px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-brand-accent flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-text-on-accent/90" />
          </div>
          <span className="text-text-primary font-semibold text-sm">حسابداری شخصی</span>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-xs px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            داشبورد
          </NavLink>
          <NavLink
            to="/accounts"
            className={({ isActive }) =>
              `text-xs px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            حساب‌ها
          </NavLink>
          <NavLink
            to="/investments"
            className={({ isActive }) =>
              `text-xs px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            سرمایه‌گذاری‌ها
          </NavLink>
          <NavLink
            to="/incomes"
            className={({ isActive }) =>
              `text-xs px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            درآمدها
          </NavLink>
          <NavLink
            to="/loans"
            className={({ isActive }) =>
              `text-xs px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            وام‌ها
          </NavLink>
          <NavLink
            to="/pending-expenses"
            className={({ isActive }) =>
              `text-xs px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-accent/10 text-brand-accent font-medium'
                  : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            هزینه‌های معوق
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          خروج
        </button>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}

function DashboardPlaceholder() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-56px)]">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-text-primary">داشبورد</h1>
        <p className="mt-2 text-sm text-text-muted">در دست توسعه</p>
        <div className="mt-6 w-8 h-px bg-brand-accent/40 mx-auto" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell>
                  <DashboardPlaceholder />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <AppShell>
                  <AccountsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <AppShell>
                  <InvestmentsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/incomes"
            element={
              <ProtectedRoute>
                <AppShell>
                  <IncomePage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <AppShell>
                  <LoansPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-expenses"
            element={
              <ProtectedRoute>
                <AppShell>
                  <PendingExpensesPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
