/** Parse "Per 100g - Calories: 22kcal | Fat: 0.34g | Carbs: 3.28g | Protein: 3.09g" into numbers */
function parseDescription(desc: string): { kcal: number; protein: number; carbs: number; fat: number } {
  const kcal = /Calories:\s*(\d+)/i.exec(desc)?.[1]
  const protein = /Protein:\s*([\d.]+)/i.exec(desc)?.[1]
  const carbs = /Carbs:\s*([\d.]+)/i.exec(desc)?.[1]
  const fat = /Fat:\s*([\d.]+)/i.exec(desc)?.[1]
  return {
    kcal: kcal ? parseInt(kcal, 10) : 0,
    protein: protein ? parseFloat(protein) : 0,
    carbs: carbs ? parseFloat(carbs) : 0,
    fat: fat ? parseFloat(fat) : 0,
  }
}

export default async function handler(req: { method?: string; query?: Record<string, string | string[] | undefined> }, res: { status: (n: number) => unknown; json: (o: object) => void; setHeader: (k: string, v: string) => void }) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const q = typeof req.query?.q === 'string' ? req.query.q.trim() : ''
  if (!q) {
    res.status(400).json({ error: 'Missing query parameter q' })
    return
  }

  const clientId = process.env.FATSECRET_CLIENT_ID
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    res.status(503).json({ error: 'FatSecret not configured' })
    return
  }

  try {
    const tokenRes = await fetch('https://oauth.fatsecret.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
      body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'basic' }).toString(),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('FatSecret token error', tokenRes.status, err)
      res.status(502).json({ error: 'FatSecret auth failed' })
      return
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string }
    if (!tokenData.access_token) {
      res.status(502).json({ error: 'FatSecret token missing' })
      return
    }

    const params = new URLSearchParams({
      method: 'foods.search',
      search_expression: q,
      format: 'json',
      max_results: '20',
    })

    const searchRes = await fetch('https://platform.fatsecret.com/rest/server.api?' + params.toString(), {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + tokenData.access_token },
    })

    if (!searchRes.ok) {
      const err = await searchRes.text()
      console.error('FatSecret search error', searchRes.status, err)
      res.status(502).json({ error: 'FatSecret search failed' })
      return
    }

    const data = (await searchRes.json()) as {
      foods?: { food?: { food_id: string; food_name: string; food_description?: string; brand_name?: string } | { food_id: string; food_name: string; food_description?: string; brand_name?: string }[] }
    }

    const foodList = data.foods?.food
    const items = Array.isArray(foodList) ? foodList : foodList ? [foodList] : []

    const results = items.map((f) => {
      const desc = f.food_description || ''
      const parsed = parseDescription(desc)
      const name = f.brand_name ? `${f.food_name} (${f.brand_name})` : f.food_name
      return {
        id: f.food_id,
        name,
        kcal: parsed.kcal,
        protein: parsed.protein,
        carbs: parsed.carbs,
        fat: parsed.fat,
      }
    })

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60')
    res.status(200).json({ foods: results })
  } catch (e) {
    console.error('FatSecret proxy error', e)
    res.status(500).json({ error: 'Search failed' })
  }
}
