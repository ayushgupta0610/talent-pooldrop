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
  activity_score: number
  calculating_score: boolean
  created_at: string
  human_checkmark: boolean
  identity_score: number
  last_calculated_at: string
  main_wallet: string
  main_wallet_changed_at: string | null
  passport_id: number
  passport_profile: {
    bio: string
    display_name: string
    image_url: string
    location: string | null
    name: string
    tags: string[]
  }
  score: number
  skills_score: number
  socials_calculated_at: string
  verified: boolean
  verified_wallets: string[]
}

export interface PassportResponse {
  passports: User[]
  pagination: {
    current_page: number
    last_page: number
    total: number
  }
}
