'use client'
import React, { useState, useEffect } from 'react'
import { Dropdown } from '@/components/Dropdown'
import Leaderboard from '@/components/Leaderboard'
import { PassportResponse, User } from '@/utils/types'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits, erc20Abi } from 'viem'
import { bulkDisburseABI } from '@/utils/abi'
import { useNotifications } from '@/context/Notifications'
import Moralis from 'moralis'
import TransferConfirmationModal from '@/components/TransferConfirmationModal'

// Define your props interface
interface AirdropPageProps {
  initialData: PassportResponse
}

interface TokenOption {
  address: string
  symbol: string
  balance: string
  decimals: number
  formattedBalance: string
}

const options = ['Based on score', 'Based on location', 'To specific users']
const criteria = ['Builder Score >= 100', 'Activity Score >= 50', 'Identity Score >= 80']
const BULK_DISBURSE_ADDRESS = '0x32dA4cAaAAd4d4805Df3b044b206Df2ad2eBadFd'
const TOKEN_ADDRESS = '0x42500d1Ea986a5B636349Ec6B01e593348885EaE'

// Define your component
const AirdropPage: React.FC<AirdropPageProps> = (props) => {
  const [addresses, setAddresses] = useState<string[]>([])
  const [selectedCriteria, setSelectedCriteria] = useState<string>('Builder Score >= 100')
  // const [tokenAddress, setTokenAddress] = useState<string>('')
  const [selectedToken, setToken] = useState<TokenOption | null>(null)
  const [tokenAmount, setTokenAmount] = useState<string>('')
  const [users, setUsers] = useState<User[]>(props.initialData?.passports || [])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'identity_score' | 'activity_score' | 'score'>('identity_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [tokenOptions, setTokenOptions] = useState<TokenOption[]>([])

  const [isApproved, setIsApproved] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const { address } = useAccount()
  const { Add: addNotification } = useNotifications()
  const [initialFetch, setInitialFetch] = useState(false)

  // const { data: tokenDecimals } = useReadContract({
  //   address: selectedToken?.address as `0x${string}`,
  //   abi: erc20Abi,
  //   functionName: 'decimals',
  // })

  const { data: allowance } = useReadContract({
    address: selectedToken?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, BULK_DISBURSE_ADDRESS],
  })

  const { writeContract: writeApprove, isPending: isApprovePending, data: approveHash } = useWriteContract()
  const { writeContract: writeTransfer, isPending: isTransferPending, data: transferHash } = useWriteContract()

  const { isLoading: isWaitingForTransaction, isSuccess: isTransactionSuccessful } = useWaitForTransactionReceipt({
    hash: approveHash || transferHash,
  })

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field as 'identity_score' | 'activity_score' | 'score')
      setSortOrder('desc')
    }
  }

  const handleApprove = async () => {
    if (!selectedToken?.address || !tokenAmount || addresses.length === 0 || !selectedToken.decimals) {
      addNotification('Missing required information for approval', { type: 'error' })
      return
    }

    const totalAmount = parseUnits((Number(tokenAmount) * addresses.length).toString(), selectedToken.decimals)

    try {
      await writeApprove({
        address: selectedToken.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [BULK_DISBURSE_ADDRESS, totalAmount],
      })

      addNotification('Approval transaction initiated', { type: 'info' })
    } catch (error) {
      console.error('Error during approval:', error)
      addNotification('Error initiating approval', { type: 'error' })
    }
  }

  const handleTransfer = () => {
    if (!selectedToken?.address || !tokenAmount || addresses.length === 0 || !selectedToken.decimals) {
      addNotification('Missing required information for pooldrop', { type: 'error' })
      return
    }

    const filteredUsers = users.filter((user) => {
      switch (selectedCriteria) {
        case criteria[0]:
          return user.score >= 100
        case criteria[1]:
          return user.activity_score >= 50
        case criteria[2]:
          return user.identity_score >= 80
        default:
          return false
      }
    })
    setSelectedUsers(filteredUsers)
    setIsModalOpen(true)
  }

  const confirmTransfer = async () => {
    setIsModalOpen(false)
    const recipients = selectedUsers.map((user) => user.main_wallet)
    const amounts = recipients.map(() => parseUnits(tokenAmount, selectedToken?.decimals as number))
    const totalAmount = parseUnits(
      (Number(tokenAmount) * recipients.length).toString(),
      selectedToken?.decimals as number
    )

    try {
      await writeTransfer({
        address: BULK_DISBURSE_ADDRESS,
        abi: bulkDisburseABI,
        functionName: 'bulkDisburse',
        args: [selectedToken?.address, recipients, amounts, totalAmount],
      })

      addNotification('Transfer transaction initiated', { type: 'info' })
    } catch (error) {
      console.error('Error during bulk disburse:', error)
      addNotification('Error initiating transfer', { type: 'error' })
    }
  }

  const handleTokenAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAmount(e.target.value)
    console.log('allowance: ', allowance)
    const totalAmount = parseUnits((Number(tokenAmount) * addresses.length).toString(), selectedToken!.decimals)
    console.log('totalAmount: ', totalAmount)
    setIsApproved(allowance! >= totalAmount)
  }

  useEffect(() => {
    if (isTransactionSuccessful) {
      if (approveHash && !isApproved) {
        setIsApproved(true)
        addNotification('Approval transaction completed', {
          type: 'success',
          href: `https://basescan.org/tx/${approveHash}`,
        })
      } else if (transferHash) {
        addNotification('Transfer transaction completed', {
          type: 'success',
          href: `https://basescan.org/tx/${transferHash}`,
        })
      }
    }
  }, [isTransactionSuccessful, approveHash, transferHash])

  useEffect(() => {
    async function fetchTokenBalances() {
      if (!address) return

      try {
        if (!Moralis.Core.isStarted) {
          await Moralis.start({
            apiKey: process.env.NEXT_PUBLIC_YOUR_MORALIS_API_KEY,
          })
        }

        const response = await Moralis.EvmApi.token.getWalletTokenBalances({
          chain: '0x2105',
          address: address,
        })

        const formatBalanceWithCommas = (token: any) => {
          let balance = formatUnits(BigInt(token.balance), token.decimals)
          return Number(balance).toLocaleString('en-US', { maximumFractionDigits: 2 })
        }

        const options: TokenOption[] = response.raw.map((token: any) => ({
          address: token.token_address,
          symbol: token.symbol,
          balance: token.balance,
          decimals: token.decimals,
          formattedBalance: formatBalanceWithCommas(token),
        }))

        // setTokenAddress(options[0].address)
        setToken(options[0])
        setTokenOptions(options)
      } catch (error) {
        console.error('Error fetching token balances:', error)
      }
    }

    fetchTokenBalances()
  }, [address])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (users && !initialFetch) {
          setInitialFetch(true)
          return // Skip fetching if initialData is populated
        }
        const res = await fetch(
          `/api/talent?currentPage=${currentPage}&search=${searchTerm}&sortField=${sortField}&sortOrder=${sortOrder}`
        )
        if (!res.ok) throw new Error('Failed to fetch data')
        const data: PassportResponse = await res.json()
        setUsers(data.passports)
        setTotalRecords(data.pagination.total)
        const filteredUsers = data.passports.filter((user) => {
          switch (selectedCriteria) {
            case criteria[0]:
              return user.score >= 100
            case criteria[1]:
              return user.activity_score >= 50
            case criteria[2]:
              return user.identity_score >= 80
            default:
              return false
          }
        })
        setAddresses(filteredUsers.map((user) => user.main_wallet))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchUsers()
  }, [currentPage, searchTerm, sortField, sortOrder, selectedCriteria])

  return (
    <div className='flex flex-col min-h-screen bg-gray-100' style={{ color: '#0052FF' }}>
      <div className='w-full p-6 bg-white shadow-md'>
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4'>
          <Dropdown
            label='Pooldrop Option'
            options={options}
            onChange={(value) => console.log(value)}
            disabledOptions={options.slice(1)}
          />
          <Dropdown label='Pooldrop Criteria' options={criteria} onChange={(value) => setSelectedCriteria(value)} />
          <Dropdown
            label='Select Token'
            options={tokenOptions.map((token) => `${token.symbol} (Balance: ${token.formattedBalance})`)}
            onChange={(value) => {
              const selectedToken = tokenOptions.find(
                (token) => `${token.symbol} (Balance: ${token.formattedBalance})` === value
              )
              if (selectedToken) {
                setToken(selectedToken)
                // setTokenAddress(selectedToken.address)
              }
            }}
          />
          <div className='w-full lg:w-2/5 flex flex-col sm:flex-row items-end gap-2'>
            <div className='w-full sm:w-2/3'>
              <label className='block text-sm font-medium mb-1'>Token Amount</label>
              <input
                type='number'
                className='w-full border border-gray-300 rounded py-2 px-4'
                value={tokenAmount}
                onChange={handleTokenAmount}
                placeholder='Per user'
              />
            </div>
            {!isApproved ? (
              <button
                className='w-full sm:w-1/4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 sm:mt-0'
                onClick={handleApprove}
                disabled={isApprovePending || isWaitingForTransaction}>
                {isApprovePending || isWaitingForTransaction ? 'Approving...' : 'Approve'}
              </button>
            ) : (
              <button
                className='w-full sm:w-1/4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 sm:mt-0'
                onClick={handleTransfer}
                disabled={isTransferPending || isWaitingForTransaction}>
                {isTransferPending || isWaitingForTransaction ? 'Processing...' : 'Pooldrop'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='w-full p-6 bg-gray-50 flex-grow'>
        <Leaderboard
          users={users}
          onAddressesChange={setAddresses}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={totalRecords}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>

      <TransferConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmTransfer}
        users={selectedUsers}
        tokenAmount={tokenAmount}
        tokenSymbol={selectedToken?.symbol || ''}
        criteria={selectedCriteria}
      />
    </div>
  )
}

// Export the component as default
export default AirdropPage
