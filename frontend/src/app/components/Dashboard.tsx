import { Transaction, CategoryData } from '../types/finance';
import { StatCard } from './StatCard';
import { ExpenseChart } from './ExpenseChart';
import { Card } from './ui/card';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useMemo } from 'react';

interface DashboardProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Alimentation': '#ef4444',
  'Transport': '#f59e0b',
  'Logement': '#8b5cf6',
  'Loisirs': '#ec4899',
  'Santé': '#06b6d4',
  'Éducation': '#3b82f6',
  'Shopping': '#a855f7',
  'Factures': '#f97316',
  'Autres': '#6b7280',
};

export function Dashboard({ transactions }: DashboardProps) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Calculate expenses by category
  const expensesByCategory: { [key: string]: number } = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  const categoryData: CategoryData[] = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#6b7280',
  }));

  // Calculate monthly trend data
  const monthlyTrend = useMemo(() => {
    const monthlyData: { [key: string]: { income: number; expenses: number; } } = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenus: data.income,
        dépenses: data.expenses,
        solde: data.income - data.expenses,
      }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Solde"
          value={`${balance.toFixed(2)} €`}
          icon={Wallet}
          color="bg-blue-500"
          trendUp={balance >= 0}
        />
        <StatCard
          title="Revenus"
          value={`${totalIncome.toFixed(2)} €`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Dépenses"
          value={`${totalExpenses.toFixed(2)} €`}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title="Économies"
          value={`${Math.max(0, balance).toFixed(2)} €`}
          icon={PiggyBank}
          color="bg-purple-500"
        />
      </div>

      {/* Monthly Trend Chart */}
      {monthlyTrend.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Évolution mensuelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorDepense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
              <Area 
                type="monotone" 
                dataKey="revenus" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRevenu)" 
                name="Revenus"
              />
              <Area 
                type="monotone" 
                dataKey="dépenses" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorDepense)" 
                name="Dépenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <ExpenseChart data={categoryData} />
    </div>
  );
}