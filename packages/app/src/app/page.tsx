import React from 'react'
import AirdropPage from './airdrop/page'
import { PassportResponse } from '@/utils/types'

export default async function Home() {
  const headers = new Headers({
    'X-API-KEY': process.env.TALENT_API_KEY || '', // Ensure the API key is correctly set
  })
  if (!process.env.TALENT_API_KEY) {
    throw new Error('TALENT_API_KEY is not defined in the environment variables.')
  }
  const res = await fetch('http://localhost:3000/api/talent?page=1', { headers }) // Adjust the API endpoint as needed
  const data: PassportResponse = await res.json()
  return <AirdropPage initialData={data} />
}
