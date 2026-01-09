import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dashboard } from './Dashboard';
import { TransactionList } from './TransactionList';
import { AddTransactionDialog } from './AddTransactionDialog';
import { CategoryAnalysis } from './CategoryAnalysis';
import { BudgetManagement } from './BudgetManagement';
import { Transaction, Budget, MonthlyBudgetStatus } from '../types/finance';
import { LayoutDashboard, List, PieChart, Wallet, LogOut } from 'lucide-react';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

const STORAGE_KEY = 'finance_transactions';
const BUDGETS_STORAGE_KEY = 'finance_budgets';
const NOTIFIED_BUDGETS_KEY = 'finance_notified_budgets';

export function MainApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifiedBudgets, setNotifiedBudgets] = useState<Set<string>>(new Set());

  // Load transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTransactions(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
  }, []);

  // Load budgets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (stored) {
      try {
        setBudgets(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading budgets:', error);
      }
    }

    const notified = localStorage.getItem(NOTIFIED_BUDGETS_KEY);
    if (notified) {
      try {
        setNotifiedBudgets(new Set(JSON.parse(notified)));
      } catch (error) {
        console.error('Error loading notified budgets:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  // Calculate monthly budget status with memoization
  const getCurrentMonthKey = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const budgetStatus = useMemo((): MonthlyBudgetStatus[] => {
    const currentMonth = getCurrentMonthKey();
    const monthStart = new Date(currentMonth + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    return budgets.map((budget) => {
      const spent = transactions
        .filter((t) => {
          if (t.type !== 'expense' || t.category !== budget.category) return false;
          const transactionDate = new Date(t.date);
          return transactionDate >= monthStart && transactionDate <= monthEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.monthlyLimit) * 100;
      const remaining = budget.monthlyLimit - spent;

      return {
        category: budget.category,
        budgetLimit: budget.monthlyLimit,
        spent,
        remaining,
        percentage,
        isWarning: percentage >= budget.notificationThreshold && percentage < 100,
        isOverBudget: percentage >= 100,
      };
    });
  }, [budgets, transactions, getCurrentMonthKey]);

  // Check for budget alerts and notify
  useEffect(() => {
    if (budgets.length === 0 || budgetStatus.length === 0) return;

    const currentMonth = getCurrentMonthKey();
    
    budgetStatus.forEach((status) => {
      const notificationKey = `${currentMonth}-${status.category}`;
      
      // Check if we've already notified for this budget this month
      if (!notifiedBudgets.has(notificationKey)) {
        if (status.isOverBudget) {
          toast.error(
            `Budget dépassé pour ${status.category} ! Vous avez dépensé ${status.spent.toFixed(2)}€ sur ${status.budgetLimit.toFixed(2)}€`,
            { duration: 10000 }
          );
          setNotifiedBudgets((prev) => {
            const newSet = new Set(prev);
            newSet.add(notificationKey);
            localStorage.setItem(NOTIFIED_BUDGETS_KEY, JSON.stringify([...newSet]));
            return newSet;
          });
        } else if (status.isWarning) {
          const budget = budgets.find((b) => b.category === status.category);
          if (budget) {
            toast.warning(
              `Attention ! Vous avez atteint ${status.percentage.toFixed(0)}% de votre budget ${status.category} (${budget.notificationThreshold}% défini)`,
              { duration: 8000 }
            );
            setNotifiedBudgets((prev) => {
              const newSet = new Set(prev);
              newSet.add(notificationKey);
              localStorage.setItem(NOTIFIED_BUDGETS_KEY, JSON.stringify([...newSet]));
              return newSet;
            });
          }
        }
      }
    });
  }, [budgetStatus, budgets, getCurrentMonthKey, notifiedBudgets]);

  // Reset notifications at the start of a new month
  useEffect(() => {
    const currentMonth = getCurrentMonthKey();
    const storedNotifications = Array.from(notifiedBudgets);
    const currentMonthNotifications = storedNotifications.filter((key) =>
      key.startsWith(currentMonth)
    );
    
    if (storedNotifications.length !== currentMonthNotifications.length && storedNotifications.length > 0) {
      const newSet = new Set(currentMonthNotifications);
      setNotifiedBudgets(newSet);
      localStorage.setItem(NOTIFIED_BUDGETS_KEY, JSON.stringify([...newSet]));
    }
  }, [getCurrentMonthKey, notifiedBudgets]);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    toast.success('Transaction ajoutée avec succès');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success('Transaction supprimée');
  };

  const handleAddBudget = (budget: Budget) => {
    setBudgets((prev) => [...prev, budget]);
  };

  const handleUpdateBudget = (oldCategory: string, newBudget: Budget) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === oldCategory ? newBudget : b))
    );
  };

  const handleDeleteBudget = (category: string) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category));
    
    // Clean up notifications for deleted budget
    const currentMonth = getCurrentMonthKey();
    const notificationKey = `${currentMonth}-${category}`;
    if (notifiedBudgets.has(notificationKey)) {
      setNotifiedBudgets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationKey);
        localStorage.setItem(NOTIFIED_BUDGETS_KEY, JSON.stringify([...newSet]));
        return newSet;
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestion Financière</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AddTransactionDialog onAddTransaction={handleAddTransaction} />
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
            <BudgetManagement
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
