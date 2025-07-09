import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTransactions } from '../hooks/useTransactions';
import type { Budget } from '../types';

interface BudgetProps {
  userId: string;
}

export function Budget({ userId }: BudgetProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { transactions } = useTransactions(userId);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
  });

  useEffect(() => {
    fetchBudgets();
  }, [userId]);

  const fetchBudgets = async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
    } else {
      setBudgets(data || []);
    }
    setLoading(false);
  };

  const calculateSpent = (budget: Budget) => {
    const now = new Date();
    let startDate: Date;

    switch (budget.period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === budget.category &&
        new Date(t.date) >= startDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const budgetData = {
      user_id: userId,
      category: formData.category,
      amount: parseFloat(formData.amount),
      period: formData.period,
      spent: 0,
    };

    try {
      if (editingBudget) {
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', editingBudget.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([budgetData]);

        if (error) throw error;
      }

      await fetchBudgets();
      setShowForm(false);
      setEditingBudget(null);
      setFormData({ category: '', amount: '', period: 'monthly' });
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (!error) {
        await fetchBudgets();
      }
    }
  };

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
  ];

  if (loading && budgets.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Budget Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No budgets yet</h3>
          <p className="text-gray-500 mb-6">Create your first budget to start tracking your spending</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spent = calculateSpent(budget);
            const percentage = (spent / budget.amount) * 100;
            const isOverBudget = spent > budget.amount;

            return (
              <div
                key={budget.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{budget.category}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
                      ${spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold text-gray-800">${budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      ${(budget.amount - spent).toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 capitalize">{budget.period}</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  {isOverBudget && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Over budget!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBudget(null);
                  setFormData({ category: '', amount: '', period: 'monthly' });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'weekly' | 'monthly' | 'yearly' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}