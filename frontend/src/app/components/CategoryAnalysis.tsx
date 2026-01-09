import { Transaction } from '../types/finance';
import { Card } from './ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { Progress } from './ui/progress';

interface CategoryAnalysisProps {
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

export function CategoryAnalysis({ transactions }: CategoryAnalysisProps) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  
  // Calculate expenses by category
  const expensesByCategory: { [key: string]: number } = {};
  const transactionCountByCategory: { [key: string]: number } = {};
  
  expenses.forEach((t) => {
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    transactionCountByCategory[t.category] = (transactionCountByCategory[t.category] || 0) + 1;
  });

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);

  // Prepare data for charts
  const barChartData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      montant: amount,
      color: CATEGORY_COLORS[category] || '#6b7280',
    }))
    .sort((a, b) => b.montant - a.montant);

  const pieChartData = barChartData.map((item) => ({
    name: item.category,
    value: item.montant,
    color: item.color,
  }));

  // Category details with percentages
  const categoryDetails = barChartData.map((item) => ({
    ...item,
    percentage: totalExpenses > 0 ? (item.montant / totalExpenses) * 100 : 0,
    count: transactionCountByCategory[item.category] || 0,
  }));

  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucune dépense enregistrée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total des dépenses</p>
              <p className="text-2xl font-semibold">{totalExpenses.toFixed(2)} €</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre de transactions</p>
              <p className="text-2xl font-semibold">{expenses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dépense moyenne</p>
              <p className="text-2xl font-semibold">
                {expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'} €
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="p-6">
          <h3 className="mb-4">Dépenses par catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
              <Bar dataKey="montant" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="mb-4">Répartition des dépenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category Details */}
      <Card className="p-6">
        <h3 className="mb-4">Détails par catégorie</h3>
        <div className="space-y-4">
          {categoryDetails.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">
                    ({category.count} transaction{category.count > 1 ? 's' : ''})
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{category.montant.toFixed(2)} €</p>
                  <p className="text-sm text-muted-foreground">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}