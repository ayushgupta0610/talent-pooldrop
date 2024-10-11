'use client'
import { useState, useEffect } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TableFooter from '@mui/material/TableFooter'
import TablePagination from '@mui/material/TablePagination'
import Avatar from '@mui/material/Avatar' // Import Avatar component
import { Sort } from '@mui/icons-material' // Import Sort icon for sorting
import { User, PassportResponse } from '../utils/types'

import { styled } from '@mui/material/styles'

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
  defaultSortField?: 'skills_score' | 'identity_score' | 'activity_score' // Add default sort field prop
  defaultSortOrder?: 'asc' | 'desc' // Add default sort order prop
  initialData?: PassportResponse // Add initial data prop
}

export default function Leaderboard({
  title,
  defaultSortOrder,
  defaultSortField,
  initialData, // Accept initial data prop
}: LeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.current_page || 0)
  const [users, setUsers] = useState<User[]>(initialData?.passports || []) // Use initial data if available
  const [totalRecords, setTotalRecords] = useState(initialData?.pagination?.total || 0)
  const [usersPerPage, setUsersPerPage] = useState(25)
  const [sortField, setSortField] = useState<string>(defaultSortField || 'activity_score') // Default sort field
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder || 'desc') // Default sort order
  const [initialFetch, setInitialFetch] = useState(false)

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUsersPerPage(parseInt(event.target.value, 10))
    setCurrentPage(0)
  }

  const handleSortChange = (field: string) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortOrder(newOrder)
  }

  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch if initialData is not provided
      if (initialData && !initialFetch) {
        setInitialFetch(true)
        return // Skip fetching if initialData is populated
      }
      const res = await fetch(
        `http://localhost:3000/api/talent?currentPage=${
          currentPage + 1
        }&usersPerPage=${usersPerPage}&sortField=${sortField}&sortOrder=${sortOrder}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error('Failed to fetch data')
      const data = await res.json()
      console.log(data)
      setUsers(data.users)
      setTotalRecords(data.totalRecords)
      setUsersPerPage(data.usersPerPage)
    }
    fetchUsers()
  }, [currentPage, usersPerPage, sortField, sortOrder])

  return (
    <StyledTableContainer>
      <h2 style={{ color: '#0052FF' }}>{title}</h2>
      <StyledTable aria-label='leaderboard table'>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Passport ID.</TableCell>
            <TableCell align='center'>User</TableCell>
            <TableCell align='right' onClick={() => handleSortChange('skills_score')}>
              Skills Score <Sort />
            </TableCell>
            <TableCell align='right' onClick={() => handleSortChange('activity_score')}>
              activity_score <Sort />
            </TableCell>
            <TableCell align='right' onClick={() => handleSortChange('identity_score')}>
              24h Games <Sort />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users?.map((user, index) => (
            <TableRow key={user.passport_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align='center'>{currentPage * usersPerPage + index + 1}</TableCell>
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
                {user.passport_profile.display_name}
              </TableCell>
              <TableCell align='right'>{user.skills_score}</TableCell>
              <TableCell align='right'>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                  <img
                    src='/images/verified.png'
                    alt='Verified Icon'
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '5px',
                    }}
                  />
                  {user.activity_score}
                </div>
              </TableCell>
              <TableCell align='right'>{user.identity_score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[25, { label: 'All', value: totalRecords }]}
              colSpan={5}
              count={totalRecords}
              rowsPerPage={usersPerPage}
              page={currentPage}
              slotProps={{
                select: {
                  inputProps: {
                    'aria-label': 'rows per page',
                  },
                  native: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </StyledTable>
    </StyledTableContainer>
  )
}
