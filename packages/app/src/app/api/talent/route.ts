import { NextResponse } from 'next/server'
import { PassportResponse } from '@/utils/types'
import { Redis } from '@upstash/redis'
import { supabase } from '@/lib/supabase'

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('currentPage') || '1', 10)
    const redisKey = `talent:page:${page}`

    // Try to get data from Redis
    const cachedData = await redis.get(redisKey)
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData))
    }

    // If not in Redis, fetch from Supabase
    const { data, error, count } = await supabase
      .from('talent_protocol')
      .select('*', { count: 'exact' })
      .range((page - 1) * 25, page * 25 - 1)

    if (error) {
      console.error('Error fetching data from Supabase:', error)
      return NextResponse.json({ error: 'Failed to fetch data from database' }, { status: 500 })
    }

    const response: PassportResponse = {
      passports: data.map(user => ({
        ...user,
        passport_profile: JSON.parse(user.passport_profile as string)
      })),
      pagination: {
        current_page: page,
        total: count || 0,
        last_page: Math.ceil((count || 0) / 25)
      }
    }

    // Cache the data in Redis
    await redis.set(redisKey, JSON.stringify(response), { ex: 3600 }) // Cache for 1 hour

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in fetch-and-store API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}