import axios from 'axios'
import { RequestConfig } from '@/lib/types/tasks'
import { Branch } from '@/lib/types/branch'
import { Reward } from '@/lib/types/rewards'
import { AxiosError } from 'axios'

export enum AccessLevel {
    USER = 'user',
    ADMIN = 'admin',
    MANAGER = 'manager'
}

export enum AccountStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending'
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
    createdAt: Date
    updatedAt: Date
    branch?: Branch
    rewards?: Reward[]
}

export interface CreateUserDTO {
    username: string
    password: string
    name: string
    surname: string
    email: string
    phone: string
    photoURL?: string
    accessLevel?: AccessLevel
    status?: AccountStatus
    userref?: string
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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const fetchUsers = async (config: RequestConfig) => {
    try {
        const response = await axios.get(`${API_URL}/user`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`
            }
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching users:', error.message)
            return { users: [], message: error.message }
        }
        throw error
    }
}

export const createUser = async (userData: CreateUserDTO, config: RequestConfig) => {
    try {
        const response = await axios.post(`${API_URL}/user`, userData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`
            }
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error creating user:', error.message)
            return { message: error.message }
        }
        throw error
    }
}

export const updateUser = async (uid: number, userData: UpdateUserDTO, config: RequestConfig) => {
    try {
        const response = await axios.patch(`${API_URL}/user/${uid}`, userData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`
            }
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error updating user:', error.message)
            return { message: error.message }
        }
        throw error
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
        if (error instanceof AxiosError) {
            console.error('Error deleting user:', error.message)
            return { message: error.message }
        }
        throw error
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
        if (error instanceof AxiosError) {
            console.error('Error restoring user:', error.message)
            return { message: error.message }
        }
        throw error
    }
} 