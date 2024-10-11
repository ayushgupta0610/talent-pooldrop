'use client'
import React from 'react'
import { Dropdown } from '@/components/Dropdown'
import { AddressInput } from '@/components/AddressInput'
import Leaderboard from '@/components/Leaderboard'
import { PassportResponse } from '@/utils/types'

interface AirdropPageProps {
  initialData: PassportResponse
}

const AirdropPage = ({ initialData }: AirdropPageProps) => {
  const options = ['Airdrop to all holders', 'Airdrop to specific addresses', 'Airdrop based on token balance']
  const criteria = ['Skills Score > 80', 'Activity Score > 60', 'Identity Score >= 80']

  return (
    <div className='flex flex-col min-h-screen bg-gray-100' style={{ color: '#0052FF' }}>
      <div className='w-full p-6 bg-white shadow-md'>
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4'>
          <Dropdown label='Airdrop Option' options={options} onChange={(value) => console.log(value)} />
          <Dropdown label='Airdrop Criteria' options={criteria} onChange={(value) => console.log(value)} />
          <div className='w-full lg:w-2/5 flex flex-col sm:flex-row items-end gap-2'>
            <div className='w-full sm:w-3/4'>
              <label className='block text-sm font-medium mb-1'>Token to Airdrop</label>
              {/* <AddressInput
                onRecipientChange={(address, isValid) => console.log(address)}
                placeholder='Enter token address'
              /> */}
              <input
                type='text'
                className='w-full border border-gray-300 rounded py-2 px-4'
                onChange={(e) => console.log(e.target.value)}
                placeholder='Enter token address'
              />
            </div>
            <button
              className='w-full sm:w-1/4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 sm:mt-0'
              onClick={() => console.log('Airdrop initiated')}>
              Airdrop
            </button>
          </div>
        </div>
      </div>

      <div className='w-full p-6 bg-gray-50 flex-grow'>
        <Leaderboard
          //   title='Airdrop Leaderboard'
          //   defaultSortField='skills_score'
          //   defaultSortOrder='desc'
          initialData={initialData}
        />
      </div>
    </div>
  )
}

export default AirdropPage
