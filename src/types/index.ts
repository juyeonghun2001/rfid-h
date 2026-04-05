export interface Hospital {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  departments?: Department[]
  _count?: {
    departments: number
    employees?: number
  }
}

export interface Department {
  id: string
  hospitalId: string
  hospital?: Hospital
  name: string
  createdAt: Date
  updatedAt: Date
  employees?: Employee[]
  _count?: {
    employees: number
  }
}

export interface Employee {
  id: string
  departmentId: string
  department?: Department & { hospital?: Hospital }
  name: string
  phone: string | null
  location: string | null
  uniformType: string | null
  rfidCode: string | null
  rfidRegisteredAt: Date | null
  memo: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ScanLog {
  id: string
  employeeId: string
  employee?: Employee & { department?: Department & { hospital?: Hospital } }
  actionType: 'SCAN' | 'REGISTER' | 'PRINT'
  rfidCode: string
  deviceId: string
  createdAt: Date
}

export interface DashboardStats {
  totalHospitals: number
  totalEmployees: number
  rfidRegistered: number
  rfidUnregistered: number
  todayScans: number
  todayRegisters: number
  todayPrints: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
