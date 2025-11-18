import { http } from '../utils/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

class ApiService {

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await http.post('api/auth/login', { body: credentials });
  }

  async register(userData: RegisterRequest): Promise<User> {
    return await http.post('api/users', { body: userData });
  }

  async getUsers(): Promise<User[]> {
    return await http.get('api/users', { auth: true });
  }

  async getUser(id: number): Promise<User> {
    return await http.get(`api/users/${id}`, { auth: true });
  }
}

export const apiService = new ApiService();