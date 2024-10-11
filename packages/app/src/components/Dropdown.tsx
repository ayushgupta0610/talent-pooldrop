import exp from 'constants'
import { ChevronDownIcon } from 'lucide-react'

interface DropdownProps {
  label: string
  options: string[]
  onChange: (value: string) => void
}

export const Dropdown = ({ label, options, onChange }: DropdownProps) => (
  <div className='w-full lg:w-1/4'>
    <label className='block text-sm font-medium mb-1'>{label}</label>
    <div className='relative'>
      <select
        onChange={(e) => onChange(e.target.value)}
        className='appearance-none w-full bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-blue-500'
        style={{ color: '#0052FF' }}>
        <option value='' disabled>
          Select an option
        </option>
        {options.map((option, index) => (
          <option key={index} value={option} style={{ color: '#0052FF' }}>
            {option}
          </option>
        ))}
      </select>
      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
        <ChevronDownIcon size={20} color='#0052FF' />
      </div>
    </div>
  </div>
)
