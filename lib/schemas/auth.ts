import * as z from 'zod'

export const signInSchema = z.object({
    username: z.string()
        .min(1, 'Username is required')
        .transform((str) => str.toLowerCase())
        .refine((value) => {
            // Email regex or username (alphanumeric + underscore, 3-30 chars)
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                /^[a-zA-Z0-9_]{3,30}$/.test(value);
        }, {
            message: 'Please enter a valid email or username'
        }),
    password: z.string()
        .min(3, 'Password must be at least 3 characters')
        .max(50, 'Password is too long'),
})

export const signUpSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
})

export const forgotPasswordSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
})

export const newPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(50, 'Password is too long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
    confirmPassword: z.string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})