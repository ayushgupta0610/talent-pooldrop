import React from 'react'
import { User } from '@/utils/types'

interface TransferConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  users: User[]
  tokenAmount: string
  tokenSymbol: string
  criteria: string
}

const TransferConfirmationModal: React.FC<TransferConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  users,
  tokenAmount,
  tokenSymbol,
  criteria,
}) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
        <h2 className='text-2xl font-bold mb-4'>Confirm Transfer</h2>
        <p className='mb-4'>
          You are about to send {tokenAmount} {tokenSymbol} to each of the following users who meet the criteria:{' '}
          {criteria}
        </p>
        <div className='mb-4 max-h-60 overflow-y-auto'>
          <table className='w-full'>
            <thead>
              <tr>
                <th className='text-left'>Username</th>
                <th className='text-left'>Address</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.passport_id}>
                  <td>{user.passport_profile.display_name}</td>
                  <td>{user.main_wallet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='flex justify-end space-x-4'>
          <button className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300' onClick={onClose}>
            Cancel
          </button>
          <button className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600' onClick={onConfirm}>
            Confirm Transfer
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransferConfirmationModal
