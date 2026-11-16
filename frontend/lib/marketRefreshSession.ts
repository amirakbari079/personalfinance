let refreshStarted = false

/** Runs the non-blocking market refresh once per browser app session. */
export async function runMarketRefreshOnce(
  refresh: () => Promise<unknown>,
  notify: () => void,
): Promise<boolean> {
  if (refreshStarted) return false
  refreshStarted = true
  try {
    await refresh()
    notify()
    return true
  } catch {
    // The UI keeps showing the last successfully stored prices. Manual retry
    // remains available and a later scheduled backend update can recover.
    return false
  }
}

export function resetMarketRefreshSessionForTests(): void {
  refreshStarted = false
}
