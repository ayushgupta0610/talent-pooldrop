import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!,
})

interface ApiResponse {
  id: string
  // Add other fields as necessary
}

interface FetchAndStoreResult {
  success: boolean
  message: string
  count?: number
}

async function fetchAndStoreInRedis({
  apiUrl,
  redisPrefix,
  options,
}: {
  apiUrl: string
  redisPrefix: string
  options?: Object
}): Promise<FetchAndStoreResult> {
  try {
    // Fetch data from API
    const response = await fetch(apiUrl, options)
    if (!response.ok) throw new Error('Failed to fetch data from API')

    const data: ApiResponse[] = await response.json()

    // Store data in Redis
    const pipeline = redis.pipeline()

    for (const item of data) {
      const key = `${redisPrefix}:${item.id}`
      pipeline.hset(key, item)
      pipeline.sadd(`${redisPrefix}:all`, item.id)
    }

    await pipeline.exec()

    return {
      success: true,
      message: 'Data fetched and stored successfully',
      count: data.length,
    }
  } catch (error) {
    console.error('Error fetching and storing data:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

async function searchData(prefix: string, searchTerm: string) {
  const allKeys = await redis.smembers(`${prefix}:all`)

  const results = []
  for (const key of allKeys) {
    const data = await redis.hgetall(`${prefix}:${key}`)
    if (JSON.stringify(data).toLowerCase().includes(searchTerm.toLowerCase())) {
      results.push(data)
    }
  }

  return results
}

async function sortData(prefix: string, sortField: string, order: 'asc' | 'desc' = 'asc') {
  const allKeys = await redis.smembers(`${prefix}:all`)

  const results = await Promise.all(allKeys.map(async (key) => redis.hgetall(`${prefix}:${key}`)))

  return results.sort((a: YourType, b: YourType) => {
    // Specify the correct type
    if (a[sortField] < b[sortField]) return order === 'asc' ? -1 : 1
    if (a[sortField] > b[sortField]) return order === 'asc' ? 1 : -1
    return 0
  })
}

export { fetchAndStoreInRedis, searchData, sortData }
