import { NextResponse } from 'next/server'
import { PassportResponse, User } from '@/utils/types'
import { Redis } from '@upstash/redis'
import { supabase } from '@/lib/supabase'

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!,
})

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('JSON parsing failed:', e);
    console.error('Attempted to parse:', str);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('currentPage') || '1', 10)
    const redisKey = `talent:page:${page}`

    console.log('Fetching data for page:', page);

    // Try to get data from Redis
    const cachedData = await redis.get(redisKey)
    if (cachedData) {
      console.log('Cache hit. Data from Redis:', cachedData);
      const parsedData = safeJsonParse(cachedData as string)
      if (parsedData) {
        return NextResponse.json(parsedData)
      } else {
        console.log('Failed to parse cached data, fetching from Supabase instead');
      }
    } else {
      console.log('Cache miss. Fetching from Supabase.');
    }

    // Fetch from Supabase
    const { data, error, count } = await supabase
      .from('talent_protocol')
      .select('*', { count: 'exact' })
      .range((page - 1) * 25, page * 25 - 1)

    if (error) {
      console.error('Error fetching data from Supabase:', error)
      return NextResponse.json({ error: 'Failed to fetch data from database' }, { status: 500 })
    }

    console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));

    const passports: User[] = data.map(user => {
      let passport_profile = user.passport_profile;
      let verified_wallets = user.verified_wallets;

      if (typeof passport_profile === 'string') {
        passport_profile = safeJsonParse(passport_profile) || {};
      }

      if (typeof verified_wallets === 'string') {
        verified_wallets = safeJsonParse(verified_wallets) || [];
      } else if (!Array.isArray(verified_wallets)) {
        verified_wallets = [];
      }

      return {
        ...user,
        passport_profile,
        verified_wallets
      };
    });

    const response: PassportResponse = {
      passports,
      pagination: {
        current_page: page,
        total: count || 0,
        last_page: Math.ceil((count || 0) / 25)
      }
    }

    console.log('Processed response:', JSON.stringify(response, null, 2));

    // Cache the data in Redis
    const stringifiedResponse = JSON.stringify(response);
    console.log('Storing in Redis:', stringifiedResponse);
    await redis.set(redisKey, stringifiedResponse, { ex: 3600 }) // Cache for 1 hour

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in fetch-and-store API route:', error)
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
}