import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, differenceInDays } from 'date-fns';
import type { Goal } from '../types';

interface GoalsProps {
  userId: string;
}

export function Goals({ userId }: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
  });

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const goalData = {
      user_id: userId,
      title: formData.title,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
      target_date: formData.target_date,
    };

    try {
      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('goals')
          .insert([goalData]);

        if (error) throw error;
      }

      await fetchGoals();
      setShowForm(false);
      setEditingGoal(null);
      setFormData({ title: '', target_amount: '', current_amount: '', target_date: '' });
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (!error) {
        await fetchGoals();
      }
    }
  };

  const updateGoalProgress = async (goalId: string, newAmount: number) => {
    const { error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId);

    if (!error) {
      await fetchGoals();
    }
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Financial Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No goals yet</h3>
          <p className="text-gray-500 mb-6">Set your first financial goal to start tracking your progress</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const daysLeft = differenceInDays(new Date(goal.target_date), new Date());
            const isOverdue = daysLeft < 0;
            const isCompleted = progress >= 100;

            return (
              <div
                key={goal.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 truncate">{goal.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-gray-800'}`}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Current</span>
                      <span className="font-semibold text-gray-800">
                        ${goal.current_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Target</span>
                      <span className="font-semibold text-gray-800">
                        ${goal.target_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold text-blue-600">
                        ${Math.max(0, goal.target_amount - goal.current_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <span className={`font-medium ${
                      isOverdue ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                    </span>
                  </div>

                  {isCompleted && (
                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                      <span>Goal completed!</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Add amount"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const amount = parseFloat(input.value);
                          if (amount > 0) {
                            updateGoalProgress(goal.id, goal.current_amount + amount);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                        const amount = parseFloat(input.value);
                        if (amount > 0) {
                          updateGoalProgress(goal.id, goal.current_amount + amount);
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
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
                {editingGoal ? 'Edit Goal' : 'Create Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                  setFormData({ title: '', target_amount: '', current_amount: '', target_date: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}