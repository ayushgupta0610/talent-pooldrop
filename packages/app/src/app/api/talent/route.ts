import { NextResponse } from 'next/server'
import { PassportResponse } from '@/utils/types'
import 'dotenv/config'

export async function GET(request: Request) {
  // Fetch the data from https://api.talentprotocol.com/api/v2/passports?page=1
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('currentPage') || '1', 10)
  // const usersPerPage = parseInt(
  //   url.searchParams.get("usersPerPage") || "7",
  //   10
  // );
  // const sortField = url.searchParams.get("sortField") || "games24h"; // Default sort field
  // const sortOrder = url.searchParams.get("sortOrder") || "desc"; // Default sort order
  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': `${process.env.TALENT_API_KEY}`,
  }
  const response = await fetch(`https://api.talentprotocol.com/api/v2/passports?page=${page}`, {
    method: 'GET',
    headers,
  })
  const data: PassportResponse = await response.json()
  return NextResponse.json(data)
}
