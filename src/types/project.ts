export type ProjectStatus = "pending" | "in-work" | "done"

export interface ProjectContact {
  name: string
  email: string
  phone: string
  address: string
}

export interface ProjectFinancials {
  expenses: number
  profits: number
}

export interface Project {
  id: number
  user_id: string
  name: string
  description: string
  status: ProjectStatus
  contact: ProjectContact
  financials: ProjectFinancials
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProjectStats {
  total: number
  pending: number
  inWork: number
  done: number
}