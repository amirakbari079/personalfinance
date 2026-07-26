/** Downloads a JSON file from an authenticated export endpoint. */
export async function downloadJson(exportUrl: string, filename: string): Promise<void> {
  const res = await fetch(exportUrl, { credentials: 'include' })
  if (!res.ok) {
    let message = 'خطا در دانلود فایل'
    try {
      const json = (await res.json()) as { message?: string }
      if (json.message) message = json.message
    } catch {
      // response may not be JSON
    }
    throw new Error(message)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportAiPortfolioJson(): Promise<void> {
  return downloadJson('/api/v1/export/ai-portfolio/download', 'portfolio-ai.json')
}
