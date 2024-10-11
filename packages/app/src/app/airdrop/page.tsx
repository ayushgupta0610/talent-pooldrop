import React, { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { AddressInput } from '@/components/AddressInput'

const AirdropPage = () => {
  const [selectedOption, setSelectedOption] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')

  const options = ['Airdrop to all holders', 'Airdrop to specific addresses', 'Airdrop based on token balance']

  return (
    <div className='flex flex-col md:flex-row h-full min-h-screen bg-gray-100'>
      {/* Left side - Dropdown */}
      <div className='w-full md:w-1/2 p-6 bg-white shadow-md'>
        <h2 className='text-2xl font-bold mb-4'>Airdrop Options</h2>
        <div className='relative'>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className='appearance-none w-full bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-blue-500'>
            <option value='' disabled>
              Select an option
            </option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
            <ChevronDownIcon size={20} />
          </div>
        </div>
        {selectedOption && (
          <div className='mt-4'>
            <h3 className='text-lg font-semibold mb-2'>Selected Option:</h3>
            <p>{selectedOption}</p>
          </div>
        )}
      </div>

      {/* Right side - Token Address Input */}
      <div className='w-full md:w-1/2 p-6 bg-gray-50'>
        <h2 className='text-2xl font-bold mb-4'>Token to Airdrop</h2>
        <AddressInput
          onRecipientChange={(address, isValid) => setTokenAddress(address)}
          placeholder='Enter token address'
        />
        {tokenAddress && (
          <div className='mt-4'>
            <h3 className='text-lg font-semibold mb-2'>Entered Token Address:</h3>
            <p className='break-all'>{tokenAddress}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AirdropPage
