import axios, { AxiosInstance } from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';

export interface CustomJwtPayload extends JwtPayload {
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

export interface LicenseInfo {
  licenseId: string;
  plan: string;
  status: string;
  features: string[];
}

export interface ProfileData {
  uid: string;
  accessLevel: string;
  name: string;
  organisationRef?: string;
  licenseInfo?: LicenseInfo;
  email: string;
  username: string;
  surname: string;
  phone: string;
  photoURL: string;
  userref: string;
  branch: {
    name: string;
    uid: string;
  };
}

export interface AuthResponse {
  message: string;
  profileData: ProfileData;
  accessToken: string;
  refreshToken: string;
}

export interface SignInCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  isAuthenticated: boolean;
  profileData: ProfileData | null;
  role: string | null;
  permissions: string[];
}

export interface ClientSignInCredentials {
  email: string;
  password: string;
}

export class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public requiredPermission?: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

class AuthService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup response interceptor for token refresh
    this.setupInterceptors();
  }

  /**
   * Sets up axios interceptors for handling token refresh
   */
  private setupInterceptors(): void {
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (this.refreshToken) {
            try {
              // Attempt to refresh token
              const newTokens = await this.refreshAccessToken(this.refreshToken);

              if (newTokens) {
                // Update tokens
                this.setTokens(newTokens.accessToken, newTokens.refreshToken);

                // Retry original request with new token
                originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
                return this.api(originalRequest);
              }
            } catch (refreshError) {
              // If refresh fails, clear tokens and throw error
              this.clearTokens();
              throw new TokenExpiredError();
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Sets the auth tokens in cookies
   */
  public setTokensInCookies(accessToken: string, refreshToken: string): void {
    // Set access token cookie (accessible by JS)
    document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Strict`;

    // Set refresh token as HttpOnly cookie (not accessible by JS)
    // Note: This relies on the backend setting the actual HttpOnly cookie
    // We're just making a request to trigger this
    this.api.post('/auth/set-refresh-token', { refreshToken })
      .catch(() => {
        // Silent fail - the backend will handle setting the cookie
      });
  }

  /**
   * Signs in a user with provided credentials
   */
  public async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data } = await this.api.post<AuthResponse>('/auth/sign-in', credentials);

      // Check if the response contains a message but no tokens - this is an error case
      if (data.message && !data.accessToken && !data.refreshToken) {
        throw new AuthenticationError(data.message);
      }

      if (data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken);
        // Also set cookies for middleware authentication
        this.setTokensInCookies(data.accessToken, data.refreshToken);
      } else {
        throw new AuthenticationError('Invalid response from server');
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AuthenticationError(
          error.response?.data?.message || 'Authentication failed',
          error.response?.status?.toString()
        );
      }
      throw new AuthenticationError(
        error instanceof Error ? error.message : 'Authentication failed'
      );
    }
  }

  /**
   * Refreshes the access token using a refresh token
   */
  public async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const { data } = await this.api.post('/auth/refresh', { refreshToken });
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Sets the auth tokens and updates axios headers
   */
  public setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  /**
   * Clears the auth tokens and removes Authorization header
   */
  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    delete this.api.defaults.headers.common['Authorization'];
  }

  /**
   * Validates a JWT token
   */
  public validateToken(token: string): boolean {
    try {
      if (!token?.trim()) {
        return false;
      }

      const decodedToken = jwtDecode<CustomJwtPayload>(token);

      if (!decodedToken || typeof decodedToken !== 'object') {
        return false;
      }

      // Check expiration
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (!decodedToken.exp || decodedToken.exp <= currentTimestamp) {
        return false;
      }

      // Check if token was issued in the past
      if (decodedToken.iat && decodedToken.iat > currentTimestamp) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the user data from a token
   */
  public getUserFromToken(token: string): Partial<CustomJwtPayload> | null {
    try {
      if (!token || !this.validateToken(token)) {
        return null;
      }

      return jwtDecode<CustomJwtPayload>(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Signs out the current user
   */
  public signOut(): void {
    this.clearTokens();

    // Clear all cookies related to authentication
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';

    // For refresh token, make a request to the backend to clear the HttpOnly cookie
    this.api.post('/auth/clear-refresh-token')
      .catch(() => {
        // Silent fail - best effort to clear cookies
      });
  }

  /**
   * Gets the current access token
   */
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Gets the current refresh token
   */
  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Signs in a client with provided credentials
   */
  public async clientSignIn(credentials: ClientSignInCredentials): Promise<AuthResponse> {
    try {
      const { data } = await this.api.post<AuthResponse>('/client-auth/sign-in', credentials);

      // Check if the response contains a message but no tokens - this is an error case
      if (data.message && !data.accessToken && !data.refreshToken) {
        throw new AuthenticationError(data.message);
      }

      if (data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken);
        // Also set cookies for middleware authentication
        this.setTokensInCookies(data.accessToken, data.refreshToken);
      } else {
        throw new AuthenticationError('Invalid response from server');
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AuthenticationError(
          error.response?.data?.message || 'Authentication failed',
          error.response?.status?.toString()
        );
      }
      throw new AuthenticationError(
        error instanceof Error ? error.message : 'Authentication failed'
      );
    }
  }
}

// Export as singleton
export const authService = new AuthService();
