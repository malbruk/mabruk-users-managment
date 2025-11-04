import axios, { AxiosInstance } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { useAuthStore } from '../state/store';
import { AssignmentPayload, AuthResponse, PricingInsight, SubscriptionPlan, UserSummary } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

const createClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
  });

  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const refreshAuthLogic = async (failedRequest: any) => {
    const { refreshToken, setSession, clearSession } = useAuthStore.getState();
    if (!refreshToken) {
      clearSession();
      return Promise.reject(failedRequest);
    }

    try {
      const response = await instance.post<AuthResponse>('/auth/refresh', { refreshToken });
      setSession(response.data);
      if (failedRequest.response?.config?.headers) {
        failedRequest.response.config.headers.Authorization = `Bearer ${response.data.token}`;
      }
    } catch (error) {
      clearSession();
      return Promise.reject(error);
    }

    return Promise.resolve();
  };

  createAuthRefreshInterceptor(instance, refreshAuthLogic, { statusCodes: [401] });

  return instance;
};

export const apiClient = createClient();

export const fetchDashboardSummary = async (): Promise<UserSummary[]> => {
  const response = await apiClient.get<UserSummary[]>('/dashboard');
  return response.data;
};

export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans');
  return response.data;
};

export const assignSubscription = async (payload: AssignmentPayload) => {
  const response = await apiClient.post('/subscriptions/assign', payload);
  return response.data;
};

export const fetchPricingInsights = async (): Promise<PricingInsight[]> => {
  const response = await apiClient.get<PricingInsight[]>('/pricing/insights');
  return response.data;
};

export const authenticate = async (email: string, password: string) => {
  const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  useAuthStore.getState().setSession(response.data);
  return response.data;
};
