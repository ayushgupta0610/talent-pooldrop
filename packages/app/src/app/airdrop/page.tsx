"use client"
import React, { useState, useEffect } from 'react'
import { Dropdown } from '@/components/Dropdown'
import { AddressInput } from '@/components/AddressInput'
import Leaderboard from '@/components/Leaderboard'
import { PassportResponse, User } from '@/utils/types'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseUnits } from 'viem'
import { bulkDisburseABI } from '@/utils/abi'
import { erc20Abi } from 'viem'
import { useNotifications } from '@/context/Notifications'

interface AirdropPageProps {
  initialData: PassportResponse
}

const AirdropPage = ({ initialData }: AirdropPageProps) => {
  const options = ['Based on score', 'Based on location', 'Based on profile']
  const criteria = ['Skills Score >= 80', 'Activity Score >= 60', 'Identity Score >= 80']

  const [addresses, setAddresses] = useState<string[]>([])
  const [selectedCriteria, setSelectedCriteria] = useState<string>('')
  const [tokenAddress, setTokenAddress] = useState<string>('')
  const [tokenAmount, setTokenAmount] = useState<string>('')
  const [users, setUsers] = useState<User[]>(initialData?.passports || [])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const { address } = useAccount()
  const { Add: addNotification } = useNotifications()

  const BULK_DISBURSE_ADDRESS = '0x1234567890123456789012345678901234567890' // Replace with actual contract address

  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    // enabled: Boolean(tokenAddress),
  })

  const { writeContract, isPending, isSuccess, isError, error } = useWriteContract()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/talent?currentPage=${currentPage}&search=${searchTerm}&sortField=${sortField}&sortOrder=${sortOrder}`)
        if (!res.ok) throw new Error('Failed to fetch data')
        const data: PassportResponse = await res.json()
        setUsers(data.passports)
        setTotalRecords(data.pagination.total)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchUsers()
  }, [currentPage, searchTerm, sortField, sortOrder])

  const handleAirdrop = () => {
    if (!tokenAddress || !tokenAmount || addresses.length === 0 || !tokenDecimals) {
      addNotification('Missing required information for airdrop', { type: 'error' })
      return
    }

    const filteredUsers = users.filter((user) => {
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

    const recipients = filteredUsers.map((user) => user.main_wallet)
    const amounts = recipients.map(() => parseUnits(tokenAmount, tokenDecimals))
    const totalAmount = parseUnits((Number(tokenAmount) * recipients.length).toString(), tokenDecimals)
   
    try {
      writeContract({
        address: BULK_DISBURSE_ADDRESS,
        abi: bulkDisburseABI,
        functionName: 'bulkDisburse',
        args: [tokenAddress, recipients, amounts, totalAmount],
      })
    } catch (error) {
      console.error('Error during bulk disburse:', error)
      addNotification('Error initiating airdrop', { type: 'error' })
    }
  }

  useEffect(() => {
    if (isSuccess) {
      addNotification('Airdrop initiated successfully', { type: 'success' })
    } else if (isError) {
      addNotification(`Airdrop failed: ${error?.message}`, { type: 'error' })
    }
  }, [isSuccess, isError, error, addNotification])

  return (
    <div className='flex flex-col min-h-screen bg-gray-100' style={{ color: '#0052FF' }}>
      <div className='w-full p-6 bg-white shadow-md'>
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4'>
          <Dropdown
            label='Airdrop Option'
            options={options}
            onChange={(value) => console.log(value)}
            disabledOptions={options.slice(1)}
          />
          <Dropdown
            label='Airdrop Criteria'
            options={criteria}
            onChange={(value) => setSelectedCriteria(value)}
          />
          <div className='w-full lg:w-2/5 flex flex-col sm:flex-row items-end gap-2'>
            
            <div className='w-full sm:w-2/3'>
              <label className='block text-sm font-medium mb-1'>Token to Airdrop</label>
              <input
                type='text'
                className='w-full border border-gray-300 rounded py-2 px-4'
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder='Enter token address'
              />
            </div>
            <div className='w-full sm:w-1/3'>
              <label className='block text-sm font-medium mb-1'>Token Amount</label>
              <input
                type='number'
                className='w-full border border-gray-300 rounded py-2 px-4'
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder='Per user'
              />
            </div>
            <button
              className='w-full sm:w-1/4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 sm:mt-0'
              onClick={handleAirdrop}
              disabled={isPending}>
              {isPending ? 'Processing...' : 'Airdrop'}
            </button>
          </div>
        </div>
      </div>

      <div className='w-full p-6 bg-gray-50 flex-grow'>
        <div className='mb-4'>
          <input
            type='text'
            placeholder='Search by username'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='border border-gray-300 rounded py-2 px-4'
          />
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className='ml-2 border border-gray-300 rounded py-2 px-4'
          >
            <option value=''>Sort by</option>
            <option value='skills_score'>Skills Score</option>
            <option value='activity_score'>Activity Score</option>
            <option value='identity_score'>Identity Score</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className='ml-2 border border-gray-300 rounded py-2 px-4'
          >
            <option value='asc'>Ascending</option>
            <option value='desc'>Descending</option>
          </select>
        </div>
        <Leaderboard
          users={users}
          onAddressesChange={setAddresses}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  )
}

export default AirdropPage