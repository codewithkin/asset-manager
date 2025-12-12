import axios from 'axios';

const WARRANTY_API_BASE_URL = process.env.NEXT_PUBLIC_WARRANTY_REGISTER_API_URL || 'http://localhost:8000';

const warrantyClient = axios.create({
  baseURL: WARRANTY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

warrantyClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export interface RegisterWarrantyPayload {
  asset_id: string;
  asset_name: string;
  user_id: string;
}

export interface WarrantyResponse {
  success: boolean;
  warranty_id?: string;
  registered_at?: string;
}

export const warrantiesApi = {
  registerWarranty: async (payload: RegisterWarrantyPayload): Promise<WarrantyResponse> => {
    const response = await warrantyClient.post('/register-warranty', payload);
    return response.data;
  },
};
