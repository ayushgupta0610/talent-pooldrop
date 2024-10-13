import { NextResponse } from 'next/server'
import { PassportResponse } from '@/utils/types'
import { fetchAndStoreInRedis, searchData, sortData } from '@/lib/redisOperations'
import 'dotenv/config'

export async function GET(request: Request) {
  console.log('We entered here')
  // Fetch the data from https://api.talentprotocol.com/api/v2/passports?page=1
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('currentPage') || '1', 10)
  // const usersPerPage = parseInt(
  //   url.searchParams.get("usersPerPage") || "7",
  //   10
  // );
  // const sortField = url.searchParams.get("sortField") || "games24h"; // Default sort field
  // const sortOrder = url.searchParams.get("sortOrder") || "desc"; // Default sort order
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-API-KEY': `${process.env.NEXT_PUBLIC_TALENT_API_KEY}`,
  })
  const response = await fetch(`https://api.talentprotocol.com/api/v2/passports?page=${page}`, {
    method: 'GET',
    headers,
  })
  const data: PassportResponse = await response.json()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  // get page number from request body
  const body = await req.json()
  const page = parseInt(body.page, 10)
  // fetch data from API and store in Redis
  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': `${process.env.NEXT_PUBLIC_TALENT_API_KEY}`,
  }
  const result = await fetchAndStoreInRedis({
    apiUrl: `https://api.talentprotocol.com/api/v2/passports?page=${page}`,
    redisPrefix: 'myapp:data',
    options: {
      method: 'GET',
      headers,
    },
  })

  if (result.success) {
    return Response.json({ message: result.message, count: result.count })
  } else {
    return Response.json({ error: result.message }, { status: 500 })
  }
}

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)
//   const action = searchParams.get('action')
//   const prefix = 'myapp:data'

//   if (action === 'search') {
//     const term = searchParams.get('term')
//     if (!term) return Response.json({ error: 'Search term is required' }, { status: 400 })
//     const results = await searchData(prefix, term)
//     return Response.json(results)
//   } else if (action === 'sort') {
//     const field = searchParams.get('field')
//     const order = searchParams.get('order') as 'asc' | 'desc'
//     if (!field) return Response.json({ error: 'Sort field is required' }, { status: 400 })
//     const results = await sortData(prefix, field, order)
//     return Response.json(results)
//   } else {
//     return Response.json({ error: 'Invalid action' }, { status: 400 })
//   }
// }
