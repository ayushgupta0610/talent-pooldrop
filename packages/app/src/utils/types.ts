export interface State<T> {
  loading: boolean
  data?: T
  error?: string
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  type: NotificationType
  message: string
  timestamp: number
  from?: string
  href?: string
}

export interface User {
  id: number
  username: string
  avatar: string
  totalGames: number
  volume: number
  games24h: number
}

export interface LeaderboardData {
  users: User[]
  currentPage: number
  usersPerPage: number
  totalPages: number
  totalRecords: number
}
