import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dashboard } from './Dashboard';
import { TransactionList } from './TransactionList';
import { AddTransactionDialogAPI } from './AddTransactionDialogAPI';
import { CategoryAnalysis } from './CategoryAnalysis';
import { BudgetManagementAPI } from './BudgetManagementAPI';
import { Transaction } from '../types/finance';
import { 
  TransactionResponse, 
  BudgetResponse, 
  BudgetStatus,
  TransactionCreate 
} from '../types/api';
import { LayoutDashboard, List, PieChart, Wallet, LogOut, RefreshCw } from 'lucide-react';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { apiService } from '../services/api';

export function MainApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Convert API transaction to local transaction format
  const convertTransaction = (apiTransaction: TransactionResponse): Transaction => ({
    id: apiTransaction.id.toString(),
    description: apiTransaction.description,
    amount: apiTransaction.amount,
    type: apiTransaction.type,
    category: apiTransaction.category || '',
    date: apiTransaction.date,
  });

  // Load data from API
  const loadData = useCallback(async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const [transactionsData, budgetsData, budgetStatusData] = await Promise.all([
        apiService.getTransactions(),
        apiService.getBudgets(),
        apiService.getBudgetsStatus(),
      ]);

      setTransactions(transactionsData.map(convertTransaction));
      setBudgets(budgetsData);
      setBudgetStatus(budgetStatusData);

      if (showToast) {
        toast.success('Données actualisées');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check for budget alerts
  useEffect(() => {
    budgetStatus.forEach((status) => {
      if (status.is_over_budget) {
        toast.error(
          `Budget dépassé pour ${status.category} ! Vous avez dépensé ${status.current_spending.toFixed(2)}€ sur ${status.monthly_limit.toFixed(2)}€`,
          { duration: 10000 }
        );
      } else if (status.is_near_limit) {
        toast.warning(
          `Attention ! Vous avez atteint ${status.percentage_used.toFixed(0)}% de votre budget ${status.category}`,
          { duration: 8000 }
        );
      }
    });
  }, [budgetStatus]);

  const handleAddTransaction = async (transactionData: TransactionCreate) => {
    try {
      await apiService.createTransaction(transactionData);
      toast.success('Transaction ajoutée avec succès');
      await loadData();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout de la transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiService.deleteTransaction(parseInt(id));
      toast.success('Transaction supprimée');
      await loadData();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleAddBudget = async (category: string, monthlyLimit: number, notificationThreshold: number) => {
    try {
      await apiService.createBudget({
        category,
        monthly_limit: monthlyLimit,
        notification_threshold: notificationThreshold,
      });
      toast.success('Budget ajouté avec succès');
      await loadData();
    } catch (error: any) {
      console.error('Error adding budget:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout du budget');
    }
  };

  const handleUpdateBudget = async (budgetId: number, category: string, monthlyLimit: number, notificationThreshold: number) => {
    try {
      await apiService.updateBudget(budgetId, {
        category,
        monthly_limit: monthlyLimit,
        notification_threshold: notificationThreshold,
      });
      toast.success('Budget mis à jour avec succès');
      await loadData();
    } catch (error: any) {
      console.error('Error updating budget:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du budget');
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    try {
      await apiService.deleteBudget(budgetId);
      toast.success('Budget supprimé');
      await loadData();
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast.error(error.message || 'Erreur lors de la suppression du budget');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestion Financière</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadData(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <AddTransactionDialogAPI onAddTransaction={handleAddTransaction} />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="budgets" className="gap-2">
              <Wallet className="w-4 h-4" />
              Budgets
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <PieChart className="w-4 h-4" />
              Catégories
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <List className="w-4 h-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard transactions={transactions} />
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetManagementAPI
              budgets={budgets}
              budgetStatus={budgetStatus}
              onAddBudget={handleAddBudget}
              onUpdateBudget={handleUpdateBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryAnalysis transactions={transactions} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}