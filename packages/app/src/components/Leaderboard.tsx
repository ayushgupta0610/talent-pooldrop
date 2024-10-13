'use client'
import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
  TablePagination,
  Avatar,
} from '@mui/material' // Import MUI components
import { Sort } from '@mui/icons-material' // Import Sort icon for sorting
import { styled } from '@mui/material/styles'
import { User, PassportResponse } from '../utils/types'
import '@/assets/leaderboard.css' // Import custom styles

// Create styled components with the Base blue color
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  '& .MuiTableCell-root': {
    color: '#0052FF',
  },
  '& .MuiTablePagination-root': {
    color: '#0052FF',
  },
}))

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: '100%', // Make table responsive
  [theme.breakpoints.up('md')]: {
    minWidth: 480, // Original minWidth on larger screens
  },
}))

interface LeaderboardProps {
  title?: string
  // defaultSortField?: 'skills_score' | 'identity_score' | 'activity_score' // Add default sort field prop
  // defaultSortOrder?: 'asc' | 'desc' // Add default sort order prop
  initialData?: PassportResponse // Add initial data prop
}

const usersPerPage = 25

export default function Leaderboard({
  title,
  // defaultSortOrder,
  // defaultSortField,
  initialData, // Accept initial data prop
}: LeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.current_page || 1)
  const [users, setUsers] = useState<User[]>(initialData?.passports || []) // Use initial data if available
  const [totalRecords, setTotalRecords] = useState(initialData?.pagination?.total || 0)
  // const [usersPerPage, setUsersPerPage] = useState(25)
  // const [sortField, setSortField] = useState<string>(defaultSortField || 'activity_score') // Default sort field
  // const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder || 'desc') // Default sort order
  const [initialFetch, setInitialFetch] = useState(false)

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setCurrentPage(currentPage + 1)
  }

  // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setUsersPerPage(parseInt(event.target.value, 10))
  //   setCurrentPage(0)
  // }

  // const handleSortChange = (field: string) => {
  //   const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'
  //   setSortField(field)
  //   setSortOrder(newOrder)
  // }

  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch if initialData is not provided
      if (initialData && !initialFetch) {
        setInitialFetch(true)
        return // Skip fetching if initialData is populated
      }
      const res = await fetch(`http://localhost:3000/api/talent?currentPage=${currentPage}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch data')
      const data: PassportResponse = await res.json()
      console.log(data)
      setUsers(data.passports)
      setTotalRecords(data.pagination.total)
      // setUsersPerPage(data.usersPerPage)
    }
    fetchUsers()
  }, [currentPage])

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}` // Format wallet address
  }

  return (
    <StyledTableContainer>
      <h2 style={{ color: '#0052FF' }}>{title}</h2>
      <StyledTable size='small' aria-label='leaderboard table'>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Passport ID</TableCell>
            <TableCell align='center'>Username</TableCell>
            <TableCell align='center'>Bio</TableCell>
            {/* <TableCell align='right'>Tags</TableCell> */}
            <TableCell align='center'>Location</TableCell>
            <TableCell align='center'>Wallet Address</TableCell>
            <TableCell align='right'>Verifiable Skills Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users?.map((user, index) => (
            <TableRow key={user.passport_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align='center'>{user.passport_id}</TableCell>
              <TableCell
                align='center'
                component='th'
                scope='row'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%', // Ensure full width
                }}>
                <Avatar
                  src={user.passport_profile.image_url || '/images/placeholder-avatar.png'}
                  alt={user.passport_profile.display_name}
                  style={{ marginRight: '8px' }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                  {user.passport_profile.display_name}
                  <img
                    src='/images/verified.png'
                    alt='Verified Icon'
                    style={{
                      width: '20px',
                      height: '20px',
                      marginLeft: '5px',
                    }}
                  />
                </div>
              </TableCell>
              <TableCell align='center'>{user.passport_profile.bio}</TableCell>
              {/* <TableCell align='right'>{user.passport_profile.tags}</TableCell> */}
              <TableCell align='center'>{user.passport_profile.location}</TableCell>
              <TableCell align='center'>
                <a
                  href={`https://basescan.org/address/${user.main_wallet}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ textDecoration: 'none', color: '#0052FF' }} // Style link
                >
                  {formatWalletAddress(user.main_wallet)}
                </a>
              </TableCell>
              <TableCell align='right'>{user.skills_score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[25]}
              colSpan={5}
              count={totalRecords}
              rowsPerPage={usersPerPage}
              page={currentPage - 1}
              slotProps={{
                select: {
                  inputProps: {
                    'aria-label': 'rows per page',
                  },
                  native: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={() => console.log}
            />
          </TableRow>
        </TableFooter>
      </StyledTable>
    </StyledTableContainer>
  )
}
