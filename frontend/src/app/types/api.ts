// ============= Auth Types =============
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
}

export interface UserInfo {
  id: number;
  email: string;
}

// ============= Transaction Types =============
export type TransactionType = 'income' | 'expense';

export interface TicketCreate {
  ticket_id?: number | null;
  type?: string | null;
  file_path?: string | null;
  size?: number | null;
}

export interface TicketResponse {
  id: number;
  user_id: number;
  transaction_id: number | null;
  type: string;
  file_path: string;
  data: string | null;
  size: number | null;
  created_at: string;
}

export interface TransactionCreate {
  description: string;
  amount: number;
  type: TransactionType;
  category?: string | null;
  date: string; // Format: YYYY-MM-DD
  tickets?: TicketCreate[] | null;
}

export interface TransactionUpdate {
  description?: string | null;
  amount?: number | null;
  type?: TransactionType | null;
  category?: string | null;
  date?: string | null;
}

export interface TransactionResponse {
  id: number;
  user_id: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  tickets: TicketResponse[];
}

// ============= Budget Types =============
export interface BudgetCreate {
  category: string;
  monthly_limit: number;
  notification_threshold: number;
}

export interface BudgetUpdate {
  category?: string | null;
  monthly_limit?: number | null;
  notification_threshold?: number | null;
}

export interface BudgetResponse {
  id: number;
  user_id: number;
  category: string;
  monthly_limit: number;
  notification_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetStatus {
  id: number;
  category: string;
  monthly_limit: number;
  current_spending: number;
  percentage_used: number;
  notification_threshold: number;
  is_over_budget: boolean;
  is_near_limit: boolean;
}

// ============= Dashboard Types =============
export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  transaction_count: number;
  month: string;
}

export interface CategoryAnalysis {
  category: string;
  total_amount: number;
  transaction_count: number;
  percentage_of_expenses: number;
}

export interface CategoriesResponse {
  expense: string[];
  income: string[];
}

// ============= Local Types (for UI) =============
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  receipt?: File;
  receiptUrl?: string;
}

export interface Budget {
  category: string;
  monthlyLimit: number;
  notificationThreshold: number;
}

export interface MonthlyBudgetStatus {
  category: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isWarning: boolean;
  isOverBudget: boolean;
}
