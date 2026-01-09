import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Wallet, Plus, Trash2, Edit, AlertTriangle, CheckCircle } from 'lucide-react';
import { BudgetResponse, BudgetStatus } from '../types/api';
import { EXPENSE_CATEGORIES } from '../types/finance';
import { toast } from 'sonner';

interface BudgetManagementAPIProps {
  budgets: BudgetResponse[];
  budgetStatus: BudgetStatus[];
  onAddBudget: (category: string, monthlyLimit: number, notificationThreshold: number) => Promise<void>;
  onUpdateBudget: (id: number, category: string, monthlyLimit: number, notificationThreshold: number) => Promise<void>;
  onDeleteBudget: (id: number) => Promise<void>;
}

export function BudgetManagementAPI({
  budgets,
  budgetStatus,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}: BudgetManagementAPIProps) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetResponse | null>(null);
  const [category, setCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [notificationThreshold, setNotificationThreshold] = useState('80');

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    const limit = parseFloat(monthlyLimit);
    const threshold = parseFloat(notificationThreshold);

    if (isNaN(limit) || limit <= 0) {
      toast.error('Le montant du budget doit être positif');
      return;
    }

    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      toast.error('Le seuil doit être entre 0 et 100');
      return;
    }

    if (budgets.some((b) => b.category === category)) {
      toast.error('Un budget existe déjà pour cette catégorie');
      return;
    }

    await onAddBudget(category, limit, threshold);
    setCategory('');
    setMonthlyLimit('');
    setNotificationThreshold('80');
    setOpenAdd(false);
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBudget) return;

    const limit = parseFloat(monthlyLimit);
    const threshold = parseFloat(notificationThreshold);

    if (isNaN(limit) || limit <= 0) {
      toast.error('Le montant du budget doit être positif');
      return;
    }

    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      toast.error('Le seuil doit être entre 0 et 100');
      return;
    }

    await onUpdateBudget(editingBudget.id, category, limit, threshold);
    setEditingBudget(null);
    setOpenEdit(false);
  };

  const openEditDialog = (budget: BudgetResponse) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setMonthlyLimit(budget.monthly_limit.toString());
    setNotificationThreshold(budget.notification_threshold.toString());
    setOpenEdit(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
      await onDeleteBudget(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gestion des Budgets</h2>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau budget mensuel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">Budget mensuel (€)</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  step="0.01"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="500.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationThreshold">Seuil d'alerte (%)</Label>
                <Input
                  id="notificationThreshold"
                  type="number"
                  value={notificationThreshold}
                  onChange={(e) => setNotificationThreshold(e.target.value)}
                  placeholder="80"
                  min="0"
                  max="100"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Vous serez notifié lorsque vous atteindrez ce pourcentage
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenAdd(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBudget} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-monthlyLimit">Budget mensuel (€)</Label>
              <Input
                id="edit-monthlyLimit"
                type="number"
                step="0.01"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notificationThreshold">Seuil d'alerte (%)</Label>
              <Input
                id="edit-notificationThreshold"
                type="number"
                value={notificationThreshold}
                onChange={(e) => setNotificationThreshold(e.target.value)}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEdit(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Mettre à jour</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {budgetStatus.length === 0 ? (
        <Card className="p-12 text-center">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-2">
            Aucun budget configuré
          </p>
          <p className="text-sm text-muted-foreground">
            Ajoutez des budgets mensuels pour suivre vos dépenses par catégorie
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetStatus.map((status) => {
            const budget = budgets.find((b) => b.id === status.id);
            if (!budget) return null;

            return (
              <Card key={status.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{status.category}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(budget)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Dépensé</span>
                      <span className="font-medium">
                        {status.current_spending.toFixed(2)}€ / {status.monthly_limit.toFixed(2)}€
                      </span>
                    </div>
                    <Progress
                      value={Math.min(status.percentage_used, 100)}
                      className="h-2"
                      indicatorClassName={
                        status.is_over_budget
                          ? 'bg-destructive'
                          : status.is_near_limit
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{status.percentage_used.toFixed(1)}%</span>
                  </div>

                  {status.is_over_budget && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      Budget dépassé de {Math.abs(status.monthly_limit - status.current_spending).toFixed(2)}€
                    </div>
                  )}

                  {status.is_near_limit && !status.is_over_budget && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      Proche du seuil d'alerte ({status.notification_threshold}%)
                    </div>
                  )}

                  {!status.is_near_limit && !status.is_over_budget && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Budget sous contrôle
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
