import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction } from '../types';

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [userId]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      return { error };
    }

    setTransactions(prev => [data, ...prev]);
    return { data };
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      return { error };
    }

    setTransactions(prev => prev.map(t => t.id === id ? data : t));
    return { data };
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return { error };
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    return { error: null };
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}