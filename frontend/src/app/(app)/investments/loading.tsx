export default function InvestmentsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-10 bg-surface-muted rounded-lg w-1/2" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <div className="luxury-card h-32 bg-surface-muted/50" />
          <div className="luxury-card h-56 bg-surface-muted/50" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="luxury-card h-16 bg-surface-muted/50" />
            ))}
          </div>
        </div>
        <div className="hidden lg:block w-80 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="luxury-card h-24 bg-surface-muted/50" />
          ))}
        </div>
      </div>
    </div>
  )
}
