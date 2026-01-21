import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Plus, Upload, Loader2, X } from 'lucide-react';
import { TransactionCreate, TransactionType, OCRItem } from '../types/api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/finance';
import { toast } from 'sonner';
import { apiService } from '../services/api';

interface AddTransactionDialogAPIProps {
  onAddTransaction: (transaction: TransactionCreate) => Promise<void>;
}

export function AddTransactionDialogAPI({ onAddTransaction }: AddTransactionDialogAPIProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États pour gérer plusieurs transactions détectées
  const [detectedItems, setDetectedItems] = useState<OCRItem[]>([]);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [showMultipleTransactions, setShowMultipleTransactions] = useState(false);
  const [editingTransactions, setEditingTransactions] = useState<Array<{
    id: string;
    description: string;
    amount: string;
    category: string;
    isValid: boolean;
  }>>([]);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Fonction pour traiter l'image OCR
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    setSelectedFile(file);
    setIsProcessingOCR(true);

    try {
      console.log('Envoi du fichier au backend:', file);
      const prediction = await apiService.processTicket(file);
      console.log('Réponse du backend:', prediction);
      
      // Stocker le ticket_id pour l'utiliser lors de la création
      if (prediction.ticket_id) {
        setTicketId(prediction.ticket_id);
      }
      
      // CAS 1 : Plusieurs items détectés (format backend avec items[])
      if (prediction.items && prediction.items.length > 0) {
        setDetectedItems(prediction.items);
        
        const transactionsToEdit = prediction.items.map((item, index) => ({
          id: `item-${index}`,
          description: item.label || '',
          amount: item.amount.toString(),
          category: '',
          isValid: true,
        }));
        
        setEditingTransactions(transactionsToEdit);
        setShowMultipleTransactions(true);
        
        toast.success(`${prediction.items.length} transaction(s) détectée(s). Veuillez vérifier et confirmer.`);
      }
      // CAS 2 : Un seul item ou format ancien (compatibilité)
      else if (prediction.description || prediction.amount) {
        if (prediction.predicted_category) {
          const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
          if (availableCategories.includes(prediction.predicted_category)) {
            setCategory(prediction.predicted_category);
            toast.success(`Catégorie prédite : ${prediction.predicted_category}. Veuillez confirmer.`);
          } else {
            toast.warning(`Catégorie prédite "${prediction.predicted_category}" non disponible. Veuillez sélectionner une catégorie.`);
          }
        }

        if (prediction.description) {
          setDescription(prediction.description);
        }

        if (prediction.amount) {
          setAmount(prediction.amount.toString());
        }
        
        setShowMultipleTransactions(false);
      }
      // CAS 3 : Aucune donnée extraite
      else {
        toast.warning('Aucune transaction détectée dans l\'image. Veuillez saisir manuellement.');
        setShowMultipleTransactions(false);
      }
    } catch (error: any) {
      console.error('Erreur OCR:', error);
      toast.error(error.message || 'Erreur lors du traitement de l\'image');
      setShowMultipleTransactions(false);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Fonction pour mettre à jour une transaction dans la liste
  const updateDetectedTransaction = (id: string, field: 'description' | 'amount' | 'category', value: string) => {
    setEditingTransactions(prev => 
      prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, [field]: value };
          
          // Valider la transaction
          const isValid = 
            updated.description.trim() !== '' &&
            updated.amount !== '' &&
            !isNaN(parseFloat(updated.amount)) &&
            parseFloat(updated.amount) > 0 &&
            updated.category !== '';
          
          return { ...updated, isValid };
        }
        return t;
      })
    );
  };

  // Fonction pour supprimer une transaction de la liste
  const removeDetectedTransaction = (id: string) => {
    setEditingTransactions(prev => prev.filter(t => t.id !== id));
    setDetectedItems(prev => {
      const index = editingTransactions.findIndex(t => t.id === id);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Fonction pour créer toutes les transactions détectées
  const handleCreateAllTransactions = async () => {
    // Vérifier que toutes les transactions sont valides
    const invalidTransactions = editingTransactions.filter(t => !t.isValid);
    if (invalidTransactions.length > 0) {
      toast.error('Veuillez corriger les transactions invalides avant de continuer');
      return;
    }

    if (editingTransactions.length === 0) {
      toast.error('Aucune transaction à créer');
      return;
    }

    setIsLoading(true);
    const failedTransactions: string[] = [];

    try {
      for (const transaction of editingTransactions) {
        try {
          const transactionData: TransactionCreate = {
            description: transaction.description,
            amount: parseFloat(transaction.amount),
            type,
            category: transaction.category || undefined,
            date,
            tickets: ticketId ? [{ ticket_id: ticketId }] : undefined,
          };

          await onAddTransaction(transactionData);
        } catch (error: any) {
          failedTransactions.push(transaction.description);
        }
      }

      if (failedTransactions.length === 0) {
        toast.success(`${editingTransactions.length} transaction(s) créée(s) avec succès !`);
        resetForm();
        setOpen(false);
      } else {
        toast.error(`${failedTransactions.length} transaction(s) échouée(s)`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création des transactions:', error);
      toast.error(error.message || 'Erreur lors de la création des transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour revenir au formulaire unique
  const handleBackToSingleForm = () => {
    setShowMultipleTransactions(false);
    setEditingTransactions([]);
    setDetectedItems([]);
    setTicketId(null);
  };

  // Fonction de réinitialisation
  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedFile(null);
    setDetectedItems([]);
    setTicketId(null);
    setEditingTransactions([]);
    setShowMultipleTransactions(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Le montant doit être un nombre positif');
      return;
    }

    setIsLoading(true);

    try {
      const transaction: TransactionCreate = {
        description,
        amount: amountNum,
        type,
        category,
        date,
      };

      await onAddTransaction(transaction);
      
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Error in form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fermer le dialog et réinitialiser
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une transaction
        </Button>
      </DialogTrigger>
      <DialogContent className={showMultipleTransactions ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>
            {showMultipleTransactions 
              ? `Nouvelles transactions (${editingTransactions.length})` 
              : 'Nouvelle transaction'}
          </DialogTitle>
        </DialogHeader>

        {/* Vue pour plusieurs transactions */}
        {showMultipleTransactions ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>{editingTransactions.length} transaction(s)</strong> détectée(s) dans votre image.
                Vérifiez et modifiez si nécessaire.
              </p>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {editingTransactions.map((transaction, index) => {
                const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
                
                return (
                  <Card key={transaction.id} className="p-4 border-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Transaction #{index + 1}</h4>
                      {editingTransactions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDetectedTransaction(transaction.id)}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label>Description *</Label>
                        <Input
                          value={transaction.description}
                          onChange={(e) => updateDetectedTransaction(transaction.id, 'description', e.target.value)}
                          placeholder="Ex: Courses"
                          className={!transaction.description ? 'border-red-500' : ''}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Montant (€) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={transaction.amount}
                          onChange={(e) => updateDetectedTransaction(transaction.id, 'amount', e.target.value)}
                          placeholder="0.00"
                          className={!transaction.amount || isNaN(parseFloat(transaction.amount)) ? 'border-red-500' : ''}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Catégorie (optionnel)</Label>
                        <Select
                          value={transaction.category}
                          onValueChange={(value) => updateDetectedTransaction(transaction.id, 'category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez (optionnel)" />
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
                    </div>

                    {!transaction.isValid && (
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ Veuillez remplir la description et le montant correctement
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-common">Date (commune à toutes les transactions)</Label>
              <Input
                id="date-common"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToSingleForm}
                disabled={isLoading}
              >
                Retour au formulaire simple
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateAllTransactions}
                  disabled={isLoading || editingTransactions.some(t => !t.isValid)}
                >
                  {isLoading ? 'Création...' : `Créer ${editingTransactions.length} transaction(s)`}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(value: TransactionType) => {
                  setType(value);
                  setCategory('');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Dépense</SelectItem>
                  <SelectItem value="income">Revenu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upload d'image OCR */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Ticket/Reçu (optionnel - OCR)</Label>
              <input
                ref={fileInputRef}
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isProcessingOCR}
                style={{ display: 'none' }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log('Clic sur le bouton');
                  fileInputRef.current?.click();
                }}
                disabled={isProcessingOCR}
                className="w-full"
              >
                {isProcessingOCR ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traitement OCR...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? selectedFile.name : 'Uploader un ticket'}
                  </>
                )}
              </Button>
              {selectedFile && !isProcessingOCR && (
                <p className="text-xs text-green-600">
                  ✓ Image sélectionnée : {selectedFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Courses"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}