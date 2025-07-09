import React, { useState } from 'react';
import { Plus, X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { format } from 'date-fns';

interface TransactionFormProps {
  userId: string;
  onClose: () => void;
}

const categories = [
  { name: 'Food & Dining', type: 'expense', icon: '🍽️' },
  { name: 'Transportation', type: 'expense', icon: '🚗' },
  { name: 'Shopping', type: 'expense', icon: '🛍️' },
  { name: 'Entertainment', type: 'expense', icon: '🎬' },
  { name: 'Bills & Utilities', type: 'expense', icon: '💡' },
  { name: 'Healthcare', type: 'expense', icon: '🏥' },
  { name: 'Salary', type: 'income', icon: '💰' },
  { name: 'Freelance', type: 'income', icon: '💻' },
  { name: 'Investment', type: 'income', icon: '📈' },
  { name: 'Other', type: 'both', icon: '📋' },
];

export function TransactionForm({ userId, onClose }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [loading, setLoading] = useState(false);
  const { addTransaction } = useTransactions(userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await addTransaction({
        user_id: userId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        type: formData.type,
        date: formData.date,
      });

      if (!error) {
        onClose();
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    cat => cat.type === formData.type || cat.type === 'both'
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                formData.type === 'expense'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                formData.type === 'income'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Description */}
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Category */}
          <div className="relative">
            <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Select category</option>
              {filteredCategories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Adding...'
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Transaction
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}