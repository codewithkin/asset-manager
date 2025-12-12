export type UserRole = "admin" | "user"

export type UserStatus = "pending" | "approved" | "rejected"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  organizationId: string
  createdAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  createdBy: string
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Department {
  id: string
  name: string
  description?: string
}

export interface Asset {
  id: string
  name: string
  categoryId: string
  departmentId: string
  datePurchased: Date
  cost: number
  createdBy: string
  createdAt: Date
  warrantyRegistered?: boolean
}
