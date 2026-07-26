export default function AccountsLoading() {

  return (

    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">

      <div className="h-10 bg-surface-muted rounded-lg w-1/2" />

      <div className="luxury-card h-32 bg-surface-muted/50" />

      <div className="luxury-card h-56 bg-surface-muted/50" />

      <div className="flex flex-col lg:flex-row gap-6">

        <div className="flex-1 space-y-2">

          {[1, 2, 3].map((i) => (

            <div key={i} className="luxury-card h-16 bg-surface-muted/50" />

          ))}

        </div>

        <div className="hidden lg:block w-80 luxury-card h-96 bg-surface-muted/50 flex-shrink-0" />

      </div>

    </div>

  )

}

