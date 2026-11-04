export default function AccountsLoading() {
  return (
    <div className="max-w-[88rem] mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-10 bg-surface-muted/50 rounded-xl w-1/2" />
      <div className="glass-card h-32 bg-surface-muted/30" />
      <div className="glass-card h-56 bg-surface-muted/30" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="account-card h-36 bg-surface-muted/30" />
        ))}
      </div>
    </div>
  )
}
