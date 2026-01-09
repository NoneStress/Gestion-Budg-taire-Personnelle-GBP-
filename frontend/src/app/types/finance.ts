export type TransactionType = 'income' | 'expense';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // base64 encoded
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export const EXPENSE_CATEGORIES = [
  'Alimentation',
  'Transport',
  'Logement',
  'Loisirs',
  'Santé',
  'Éducation',
  'Shopping',
  'Factures',
  'Autres',
];

export const INCOME_CATEGORIES = [
  'Salaire',
  'Freelance',
  'Investissements',
  'Autres revenus',
];

export interface Budget {
  category: string;
  monthlyLimit: number;
  notificationThreshold: number; // Percentage (e.g., 80 for 80%)
}

export interface MonthlyBudgetStatus {
  category: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isWarning: boolean; // >80%
  isOverBudget: boolean; // >100%
}