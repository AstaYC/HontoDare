export interface User {
  id: number
  username: string
  name: string
  email: string
  password?: string // Optional when updating
  avatarUrl?: string
  points: number
  role: string
}

export enum Role {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  USER = "USER",
}
