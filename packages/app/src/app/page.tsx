import React from 'react'
import AirdropPage from './airdrop/page'
import { PassportResponse } from '@/utils/types'

export default async function Home() {
  const headers = new Headers({
    'Cache-Control': 'no-cache',
    'X-API-KEY': process.env.NEXT_PUBLIC_TALENT_API_KEY || '', // Ensure the API key is correctly set
  })
  if (!process.env.NEXT_PUBLIC_TALENT_API_KEY) {
    throw new Error('TALENT_API_KEY is not defined in the environment variables.')
  }
  const res = await fetch('http://localhost:3000/api/talent?page=1', { headers }) // Adjust the API endpoint as needed
  const data: PassportResponse = await res.json()
  return <AirdropPage initialData={data} />
}
