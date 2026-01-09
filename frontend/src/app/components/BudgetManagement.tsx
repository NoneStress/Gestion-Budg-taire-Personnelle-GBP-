import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Budget, MonthlyBudgetStatus, EXPENSE_CATEGORIES } from '../types/finance';
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetManagementProps {
  budgets: Budget[];
  budgetStatus: MonthlyBudgetStatus[];
  onAddBudget: (budget: Budget) => void;
  onUpdateBudget: (oldCategory: string, newBudget: Budget) => void;
  onDeleteBudget: (category: string) => void;
}

export function BudgetManagement({
  budgets,
  budgetStatus,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}: BudgetManagementProps) {
  const [openAdd, setOpenAdd] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [threshold, setThreshold] = useState('80');

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !budgets.find((b) => b.category === cat) || cat === editingBudget?.category
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !monthlyLimit) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const budget: Budget = {
      category,
      monthlyLimit: parseFloat(monthlyLimit),
      notificationThreshold: parseFloat(threshold),
    };

    if (editingBudget) {
      onUpdateBudget(editingBudget.category, budget);
      toast.success('Budget mis à jour');
      setEditingBudget(null);
    } else {
      onAddBudget(budget);
      toast.success('Budget ajouté');
      setOpenAdd(false);
    }

    // Reset form
    setCategory('');
    setMonthlyLimit('');
    setThreshold('80');
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setMonthlyLimit(budget.monthlyLimit.toString());
    setThreshold(budget.notificationThreshold.toString());
  };

  const handleDelete = (category: string) => {
    onDeleteBudget(category);
    toast.success('Budget supprimé');
  };

  const getBudgetStatusIcon = (status: MonthlyBudgetStatus) => {
    if (status.isOverBudget) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else if (status.isWarning) {
      return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getBudgetStatusColor = (status: MonthlyBudgetStatus) => {
    if (status.isOverBudget) return 'border-red-300 bg-red-50';
    if (status.isWarning) return 'border-orange-300 bg-orange-50';
    return 'border-green-300 bg-green-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des budgets</h2>
          <p className="text-sm text-muted-foreground">
            Définissez des limites mensuelles pour chaque catégorie de dépenses
          </p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Nouveau budget mensuel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Budget mensuel (€)</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="500.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Seuil d'alerte (%)</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="1"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="80"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Vous serez alerté lorsque ce pourcentage est atteint
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Modifier le budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-limit">Budget mensuel (€)</Label>
              <Input
                id="edit-limit"
                type="number"
                step="0.01"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-threshold">Seuil d'alerte (%)</Label>
              <Input
                id="edit-threshold"
                type="number"
                min="1"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingBudget(null)}>
                Annuler
              </Button>
              <Button type="submit">Mettre à jour</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Budget Status Cards */}
      {budgetStatus.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Aucun budget défini pour le mois en cours</p>
          <p className="text-sm text-muted-foreground mt-2">
            Commencez par ajouter un budget pour suivre vos dépenses
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatus.map((status) => {
            const budget = budgets.find((b) => b.category === status.category);
            return (
              <Card
                key={status.category}
                className={`p-6 border-2 ${getBudgetStatusColor(status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getBudgetStatusIcon(status)}
                    <div>
                      <h3 className="font-semibold">{status.category}</h3>
                      <p className="text-sm text-muted-foreground">
                        Budget: {status.budgetLimit.toFixed(2)} €/mois
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => budget && handleEdit(budget)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(status.category)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dépensé: {status.spent.toFixed(2)} €</span>
                    <span className={status.isOverBudget ? 'text-red-600 font-semibold' : ''}>
                      {status.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(status.percentage, 100)}
                    className={`h-3 ${
                      status.isOverBudget
                        ? '[&>div]:bg-red-600'
                        : status.isWarning
                        ? '[&>div]:bg-orange-500'
                        : '[&>div]:bg-green-600'
                    }`}
                  />
                  <div className="flex justify-between text-sm">
                    <span className={status.remaining < 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                      {status.remaining >= 0 ? 'Restant' : 'Dépassement'}: 
                      {' '}{Math.abs(status.remaining).toFixed(2)} €
                    </span>
                  </div>
                </div>

                {status.isOverBudget && (
                  <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded-md">
                    <p className="text-xs text-red-800">
                      ⚠️ Budget dépassé ! Réduisez vos dépenses pour ce mois.
                    </p>
                  </div>
                )}
                {status.isWarning && !status.isOverBudget && (
                  <div className="mt-4 p-2 bg-orange-100 border border-orange-300 rounded-md">
                    <p className="text-xs text-orange-800">
                      ⚠️ Attention ! Vous avez atteint {status.percentage.toFixed(0)}% de votre budget.
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}