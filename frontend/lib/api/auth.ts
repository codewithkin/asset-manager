import { apiClient } from './client';
import type { User } from '@/types';
import type { LoginCredentials } from '@/types/auth';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return data;
  },

  signup: async (credentials: SignupCredentials): Promise<SignupResponse> => {
    const { data } = await apiClient.post<SignupResponse>('/auth/signup', {
      email: credentials.email,
      password: credentials.password,
      name: credentials.name,
    });
    return data;
  },

  googleAuth: () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    window.location.href = `${baseUrl}/auth/google`;
  },
};

