/** One item from our /api/fatsecret-search proxy (same shape as FoodTemplate + id) */
export interface FatSecretFood {
  id: string
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export async function searchFatSecret(query: string): Promise<FatSecretFood[]> {
  if (!query.trim()) return []
  const q = encodeURIComponent(query.trim())
  const url = `/api/fatsecret-search?q=${q}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = (await res.json()) as { foods?: FatSecretFood[] }
  return data.foods ?? []
}
