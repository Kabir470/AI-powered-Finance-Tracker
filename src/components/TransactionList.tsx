import React, { useState } from 'react';
import { Edit, Trash2, Calendar, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { format } from 'date-fns';
import clsx from 'clsx';

interface TransactionListProps {
  userId: string;
}

export function TransactionList({ userId }: TransactionListProps) {
  const { transactions, loading, deleteTransaction } = useTransactions(userId);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all duration-200',
              filter === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('income')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all duration-200',
              filter === 'income'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Income
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all duration-200',
              filter === 'expense'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Expenses
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/20 hover:bg-white/80 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  'p-2 rounded-full',
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                )}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800">{transaction.description}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {transaction.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={clsx(
                  'font-semibold text-lg',
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}