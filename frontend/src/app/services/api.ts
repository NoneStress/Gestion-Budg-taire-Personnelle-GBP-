import { API_BASE_URL, TOKEN_KEY } from '../config/api';
import {
  RegisterRequest,
  LoginRequest,
  TokenResponse,
  UserInfo,
  TransactionCreate,
  TransactionUpdate,
  TransactionResponse,
  BudgetCreate,
  BudgetUpdate,
  BudgetResponse,
  BudgetStatus,
  DashboardSummary,
  CategoryAnalysis,
  CategoriesResponse,
  TransactionType,
} from '../types/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Une erreur est survenue' }));
      throw new Error(error.detail || `Erreur HTTP: ${response.status}`);
    }
    return response.json();
  }

  // ============= Authentication =============
  async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<TokenResponse>(response);
  }

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<TokenResponse>(response);
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  async getCurrentUser(): Promise<UserInfo> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<UserInfo>(response);
  }

  // ============= Transactions =============
  async getTransactions(filters?: {
    type?: TransactionType;
    category?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<TransactionResponse[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const url = `${this.baseUrl}/api/v1/api/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<TransactionResponse[]>(response);
  }

  async createTransaction(data: TransactionCreate): Promise<TransactionResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/transactions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<TransactionResponse>(response);
  }

  async updateTransaction(id: number, data: TransactionUpdate): Promise<TransactionResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/transactions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<TransactionResponse>(response);
  }

  async deleteTransaction(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  async reclassifyTransaction(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/transactions/${id}/reclassify`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  // ============= Budgets =============
  async getBudgets(): Promise<BudgetResponse[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/budgets`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<BudgetResponse[]>(response);
  }

  async createBudget(data: BudgetCreate): Promise<BudgetResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/budgets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<BudgetResponse>(response);
  }

  async updateBudget(id: number, data: BudgetUpdate): Promise<BudgetResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/budgets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<BudgetResponse>(response);
  }

  async deleteBudget(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/budgets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  // ============= Dashboard =============
  async getDashboardSummary(month?: string): Promise<DashboardSummary> {
    const params = month ? `?month=${month}` : '';
    const response = await fetch(`${this.baseUrl}/api/v1/api/dashboard/summary${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DashboardSummary>(response);
  }

  async getBudgetsStatus(): Promise<BudgetStatus[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/budgets/status`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<BudgetStatus[]>(response);
  }

  async getCategoriesAnalysis(month?: string): Promise<CategoryAnalysis[]> {
    const params = month ? `?month=${month}` : '';
    const response = await fetch(`${this.baseUrl}/api/v1/api/categories/analysis${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<CategoryAnalysis[]>(response);
  }

  // ============= Categories =============
  async getCategories(): Promise<CategoriesResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/api/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse<CategoriesResponse>(response);
  }

  // ============= OCR =============
  async processTicket(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${this.baseUrl}/api/v1/extract_text/image/process_ticket`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    await this.handleResponse(response);
  }
}

export const apiService = new ApiService();
