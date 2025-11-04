export interface UserSummary {
  id: string;
  name: string;
  email: string;
  activeSubscriptions: number;
  lastLogin: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
}

export interface PricingInsight {
  planId: string;
  planName: string;
  monthlyRevenue: number;
  churnRate: number;
  trend: 'up' | 'down' | 'flat';
}

export interface AssignmentPayload {
  userId: string;
  planId: string;
  seats: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
}
