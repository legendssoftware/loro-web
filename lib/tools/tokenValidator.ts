import { jwtDecode, JwtPayload } from 'jwt-decode';
import toast from 'react-hot-toast';

interface CustomJwtPayload extends JwtPayload {
    exp: number;
    iat: number;
    sub: string;
    uid: string;
    role: string;
    organisationRef: string;
    licenseId: string;
    licensePlan: string;
    features: string[];
}

/**
 * Validates a JWT token by checking its expiration and structure
 * @param token - The JWT token string to validate
 * @returns Promise<boolean> indicating if the token is valid
 * @throws Error if token is malformed or empty
 */
export const tokenValidator = (token: string): boolean => {
    try {
        // Early return if token is missing or empty
        if (!token?.trim()) {
            return false;
        }

        const decodedToken = jwtDecode<CustomJwtPayload>(token);

        // Validate token structure
        if (!decodedToken || typeof decodedToken !== 'object') {
            return false;
        }

        // Check expiration
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (!decodedToken.exp || decodedToken.exp <= currentTimestamp) {
            return false;
        }

        // Optional: Add additional validation checks
        // Check if token was issued in the past
        if (decodedToken.iat && decodedToken.iat > currentTimestamp) {
            return false;
        }

        return true;
    } catch (error) {
        // Handle decoding errors (malformed tokens)
        toast.error(`Session Expired: ${error}`, {
            style: {
                borderRadius: '5px',
                background: '#333',
                color: '#fff',
                fontFamily: 'var(--font-unbounded)',
                fontSize: '12px',
                textTransform: 'uppercase',
                fontWeight: '300',
                padding: '16px',
            },
            duration: 5000,
            position: 'bottom-center',
            icon: '❌',
        })
        return false;
    }
};