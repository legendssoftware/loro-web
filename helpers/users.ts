import axios from 'axios'
import { RequestConfig } from '@/lib/types/tasks'
import { Branch } from '@/lib/types/branch'
import { Reward } from '@/lib/types/rewards'
import { AxiosError } from 'axios'
import { Organisation } from './organisation'

export enum AccessLevel {
    USER = 'USER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER'
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING'
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
    branch?: Branch
    rewards?: Reward[]
    organisation?: Organisation
    organisationRef?: string
}

export interface CreateUserDTO {
    username: string
    password: string
    name: string
    surname: string
    email: string
    phone: string
    photoURL: string
    accessLevel: AccessLevel
    status: AccountStatus
    userref?: string
    organisationRef?: number
    branchId?: number
}

export interface UpdateUserDTO {
    username?: string
    name?: string
    surname?: string
    email?: string
    phone?: string
    photoURL?: string
    accessLevel?: AccessLevel
    status?: AccountStatus
    userref?: string
    organisationRef?: number
    branchId?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const fetchUsers = async (config: RequestConfig): Promise<{ users: User[] }> => {
    try {
        const response = await axios.get(`${API_URL}/user`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`
            },
            timeout: 5000 // 5 second timeout
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.code === 'ECONNABORTED') {
                console.error('Request timeout:', error)
                return { users: [] }
            }
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Server error:', error.response.data)
                return { users: [] }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Network error:', error.message)
                return { users: [] }
            }
        }
        return { users: [] }
    }
}

export const createUser = async (userData: CreateUserDTO, config: RequestConfig): Promise<{ message: string }> => {
    try {
        const response = await axios.post(`${API_URL}/user`, userData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`
            },
            timeout: 5000
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return { message: error.message }
        }
        return { message: 'An unknown error occurred' }
    }
}

export const updateUser = async (uid: number, userData: UpdateUserDTO, config: RequestConfig): Promise<{ message: string }> => {
    try {
        const response = await axios.patch(`${API_URL}/user/${uid}`, userData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`
            },
            timeout: 5000
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            return { message: error.message }
        }
        return { message: 'An unknown error occurred' }
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