import React, { PropsWithChildren } from 'react'
import Header from './Header' // Make sure to create this file in the same directory
import { Footer } from './Footer'

export function Layout(props: PropsWithChildren) {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow px-4 container max-w-7xl mx-auto py-8'>{props.children}</main>
      <Footer />
    </div>
  )
}
