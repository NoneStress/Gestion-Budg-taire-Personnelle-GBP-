import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, RadialBarChart, RadialBar } from 'recharts';
import { Card } from './ui/card';
import { CategoryData } from '../types/finance';

interface ExpenseChartProps {
  data: CategoryData[];
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Dépenses par catégorie</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Aucune dépense enregistrée
        </div>
      </Card>
    );
  }

  // Prepare data for radial chart
  const radialData = data.map((item, index) => ({
    ...item,
    fill: item.color,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut Chart */}
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Répartition des dépenses</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => `${value} (${entry.payload.value.toFixed(2)}€)`}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Radial Bar Chart */}
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Vue comparative</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="10%" 
            outerRadius="90%" 
            data={radialData} 
            startAngle={180} 
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
              background
              clockWise
              dataKey="value"
            />
            <Legend 
              iconSize={10} 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              formatter={(value, entry: any) => `${value}`}
            />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
          </RadialBarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}