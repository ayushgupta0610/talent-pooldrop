import React from 'react'
import Link from 'next/link'
import { Connect } from '@/components/Connect'

const Header = () => {
  return (
    <header className='bg-blue-500 text-white'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex justify-between items-center'>
          <Link href='/' className='text-2xl font-bold'>
            Airdrop Tool
          </Link>
          <div className='flex items-center space-x-4'>
            {' '}
            <nav>
              <ul className='flex space-x-4'>
                <li>
                  <Link href='/dashboard' className='hover:text-blue-200'>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href='/airdrop' className='hover:text-blue-200'>
                    Airdrop
                  </Link>
                </li>
                <li>
                  <Link href='/profiles' className='hover:text-blue-200'>
                    Profiles
                  </Link>
                </li>
              </ul>
            </nav>
            <Connect />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
