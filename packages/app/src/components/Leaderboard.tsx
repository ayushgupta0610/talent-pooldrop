import React from 'react'
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
  TableSortLabel,
  Tooltip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { User } from '../utils/types'
import { useState } from 'react'

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  '& .MuiTableCell-root': {
    color: '#0052FF',
  },
  '& .MuiTablePagination-root': {
    color: '#0052FF',
  },
}))

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: '100%',
  [theme.breakpoints.up('md')]: {
    minWidth: 480,
  },
}))

interface LeaderboardProps {
  users: User[]
  onAddressesChange: (addresses: string[]) => void
  currentPage: number
  onPageChange: (page: number) => void
  totalRecords: number
  sortField: string
  sortOrder: 'asc' | 'desc'
  onSortChange: (field: string) => void
}

const USERS_PER_PAGE = 50

export default function Leaderboard({
  users,
  onAddressesChange,
  currentPage,
  onPageChange,
  totalRecords,
  sortField,
  sortOrder,
  onSortChange,
}: LeaderboardProps) {
  const [pageInput, setPageInput] = useState(currentPage)

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    onPageChange(newPage + 1)
  }

  React.useEffect(() => {
    onAddressesChange(users.map((user) => user.main_wallet))
  }, [users, onAddressesChange])

  const formatWalletAddress = (address: string) => {
    if (!address) return ''
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`
  }

  const createSortHandler = (field: string) => () => {
    onSortChange(field)
  }

  const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    // if (value > 0 && value <= Math.ceil(totalRecords / USERS_PER_PAGE)) {
      setPageInput(value)
    // }
  }

  const handleJumpToPage = () => {
    if (pageInput > 0 && pageInput <= Math.ceil(totalRecords / USERS_PER_PAGE))
      onPageChange(pageInput - 1)
  }

  return (
    <StyledTableContainer>
      <StyledTable size='small' aria-label='leaderboard table'>
        <TableHead>
          <TableRow>
            {/* <TableCell align="center">Passport ID</TableCell> */}
            <TableCell align='center' style={{ fontWeight: 'bold' }}>
              Username
            </TableCell>
            <TableCell align='center' style={{ fontWeight: 'bold' }}>
              Bio
            </TableCell>
            <TableCell align='center' style={{ fontWeight: 'bold' }}>
              Location
            </TableCell>
            <TableCell align='center' style={{ fontWeight: 'bold' }}>
              Wallet Address
            </TableCell>
            <TableCell align='center' style={{ fontWeight: 'bold' }}>
              <Tooltip title="Talent Protocol aggregates a wide range of reputation data points, and calculates a dynamic Builder Score that represents a user's reputation as an onchain builder" arrow>
                <span>
                  <TableSortLabel
                    active={sortField === 'score'}
                    direction={sortField === 'score' ? sortOrder : 'asc'}
                    onClick={createSortHandler('score')}>
                    Builder Score
                  </TableSortLabel>
                </span>
              </Tooltip>
            </TableCell>
            <TableCell align='center' style={{ fontWeight: 'bold' }}>
              <Tooltip title="Activity score help separate trusted actors and value-add members, from bad actors, farmers and users only capturing value." arrow>
                <span>
                  <TableSortLabel
                    active={sortField === 'activity_score'}
                    direction={sortField === 'activity_score' ? sortOrder : 'asc'}
                    onClick={createSortHandler('activity_score')}>
                    Activity Score
                  </TableSortLabel>
                </span>
              </Tooltip>
            </TableCell>
            <TableCell align='center' style={{ fontWeight: 'bold' }}>
              <Tooltip title="Identity credentials help separate humans from sybils, bots and fake accounts. " arrow>
                <span>
                  <TableSortLabel
                    active={sortField === 'identity_score'}
                    direction={sortField === 'identity_score' ? sortOrder : 'asc'}
                    onClick={createSortHandler('identity_score')}>
                    Identity Score
                  </TableSortLabel>
                </span>
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.passport_id}>
              {/* <TableCell align="center">{user.passport_id}</TableCell> */}
              <TableCell align='center'>
                <a
                  href={`https://passport.talentprotocol.com/profile/${user.passport_id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ textDecoration: 'none', color: '#0052FF', fontWeight: 'bold' }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar
                      src={user.passport_profile.image_url}
                      alt={user.passport_profile.display_name}
                      style={{ marginRight: '8px' }}
                    />
                    {user.passport_profile.display_name}
                  </div>
                </a>
              </TableCell>
              <TableCell align='center'>{user.passport_profile.bio}</TableCell>
              <TableCell align='center'>{user.passport_profile.location}</TableCell>
              <TableCell align='center'>
                <a
                  href={`https://basescan.org/address/${user.main_wallet}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ textDecoration: 'none', color: '#0052FF' }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
                  {formatWalletAddress(user.main_wallet)}
                </a>
              </TableCell>
              <TableCell align='center'>{user.score}</TableCell>
              <TableCell align='center'>{user.activity_score}</TableCell>
              <TableCell align='center'>{user.identity_score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[USERS_PER_PAGE]}
              colSpan={6}
              count={totalRecords}
              rowsPerPage={USERS_PER_PAGE}
              page={currentPage - 1}
              onPageChange={handleChangePage}
            />
            <TableCell>
              <input
                type="number"
                value={pageInput || 1}
                onChange={handlePageInputChange}
                style={{ width: '4em', marginRight: '8px' }}
              />
              <button onClick={handleJumpToPage}>Get</button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </StyledTable>
    </StyledTableContainer>
  )
}
