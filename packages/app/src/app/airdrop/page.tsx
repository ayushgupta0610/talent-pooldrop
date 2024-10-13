'use client'
import React from 'react'
import { Dropdown } from '@/components/Dropdown'
import { AddressInput } from '@/components/AddressInput'
import Leaderboard from '@/components/Leaderboard'
import { PassportResponse, User } from '@/utils/types'

interface AirdropPageProps {
  initialData: PassportResponse
}

const AirdropPage = ({ initialData }: AirdropPageProps) => {
  const options = ['Based on score', 'Based on location', 'Based on profile']
  const criteria = ['Skills Score >= 80', 'Activity Score >= 60', 'Identity Score >= 80']

  // Step 1: Add state for addresses and selected criteria
  const [addresses, setAddresses] = React.useState<string[]>([])
  const [selectedCriteria, setSelectedCriteria] = React.useState<string>('')

  const handleAirdrop = () => {
    // Step 3: Access addresses and scores on button click
    const filteredUsers = initialData.passports.filter((user) => {
      switch (selectedCriteria) {
        case criteria[0]:
          return user.skills_score >= 80
        case criteria[1]:
          return user.activity_score >= 60
        case criteria[2]:
          return user.identity_score >= 80
        default:
          return false
      }
    })

    const airdropData = filteredUsers.map((user) => ({
      address: user.main_wallet,
      skillsScore: user.skills_score,
      activityScore: user.activity_score,
      identityScore: user.identity_score,
    }))

    console.log('Airdrop initiated with data:', airdropData)
  }

  return (
    <div className='flex flex-col min-h-screen bg-gray-100' style={{ color: '#0052FF' }}>
      <div className='w-full p-6 bg-white shadow-md'>
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4'>
          <Dropdown
            label='Airdrop Option'
            options={options}
            onChange={(value) => console.log(value)}
            disabledOptions={options.slice(1)} // Disable other options
          />
          <Dropdown
            label='Airdrop Criteria'
            options={criteria}
            onChange={(value) => setSelectedCriteria(value)} // Step 2: Update selected criteria
          />
          <div className='w-full lg:w-2/5 flex flex-col sm:flex-row items-end gap-2'>
            <div className='w-full sm:w-3/4'>
              <label className='block text-sm font-medium mb-1'>Token to Airdrop</label>
              <input
                type='text'
                className='w-full border border-gray-300 rounded py-2 px-4'
                onChange={(e) => console.log(e.target.value)}
                placeholder='Enter token address'
              />
            </div>
            <button
              className='w-full sm:w-1/4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 sm:mt-0'
              onClick={handleAirdrop}>
              Airdrop
            </button>
          </div>
        </div>
      </div>

      <div className='w-full p-6 bg-gray-50 flex-grow'>
        <Leaderboard initialData={initialData} onAddressesChange={setAddresses} />
      </div>
    </div>
  )
}

export default AirdropPage
