import axios from 'axios'
import { RequestConfig } from '@/lib/types/tasks'
import { Reward } from '@/lib/types/rewards'

export enum AccessLevel {
    USER = 'user',
    ADMIN = 'admin',
    MANAGER = 'manager',
    SUPPORT = 'support',
    DEVELOPER = 'developer',
    OWNER = 'owner',
    SUPERVISOR = 'supervisor'
}

export enum AccountStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    SUSPENDED = 'suspended'
}

export interface User {
    uid: number
    username: string
    name: string
    surname: string
    email: string
    phone: string
    photoURL: string
    accessLevel: AccessLevel
    status: AccountStatus
    userref: string
    isDeleted: boolean
    createdAt: string
    updatedAt: string
    branch?: {
        uid: number
        name: string
    }
    rewards?: Reward[]
    organisation?: {
        uid: number
        name: string
    }
    organisationRef?: string
}

export interface CreateUserDTO extends Omit<User, 'uid'> {
    password: string
}

export type UpdateUserDTO = Partial<CreateUserDTO>

export interface UsersRequestConfig extends Omit<RequestConfig, 'headers'> {
    page?: number
    limit?: number
    headers?: {
        token?: string
        Authorization?: string
        'Content-Type'?: string
    }
    filters?: {
        status?: string
        accessLevel?: string
        search?: string
        branchId?: number
        organisationId?: number
    }
}

export interface PaginatedUsersResponse {
    data: User[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
    message: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const fetchUsers = async (config: UsersRequestConfig): Promise<PaginatedUsersResponse> => {
    try {
        const { page = 1, limit = 10, headers, filters } = config
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters?.status && { status: filters.status }),
            ...(filters?.accessLevel && { accessLevel: filters.accessLevel }),
            ...(filters?.search && { search: filters.search }),
            ...(filters?.branchId && { branchId: filters.branchId.toString() }),
            ...(filters?.organisationId && { organisationId: filters.organisationId.toString() }),
        })

        const response = await fetch(
            `${API_URL}/user?${queryParams.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${headers?.token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        
        if (!response.ok) {
            throw new Error('Failed to fetch users')
        }
        
        const data = await response.json()
        return data
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to fetch users")
    }
}

export const createUser = async (userData: CreateUserDTO, config: RequestConfig) => {
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })

        if (!response.ok) {
            throw new Error('Failed to create user')
        }

        const data = await response.json()
        return data
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to create user")
    }
}

export const updateUser = async (uid: number, userData: UpdateUserDTO, config: RequestConfig) => {
    try {
        const response = await fetch(`${API_URL}/user/${uid}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })

        if (!response.ok) {
            throw new Error('Failed to update user')
        }

        const data = await response.json()
        return data
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Failed to update user")
    }
}

export const deleteUser = async (uid: number, config: RequestConfig) => {
    try {
        const response = await axios.delete(`${API_URL}/user/${uid}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`
            }
        })
        return response.data
    } catch (error) {
        return error
    }
}

export const restoreUser = async (uid: number, config: RequestConfig) => {
    try {
        const response = await axios.patch(`${API_URL}/user/restore/${uid}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`
            }
        })
        return response.data
    } catch (error) {
        return error
    }
} 