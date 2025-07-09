import React from 'react';
import { BarChart3, Plus, List, Settings, LogOut, PieChart, Target, Bot, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddTransaction: () => void;
}

export function Navigation({ activeTab, onTabChange, onAddTransaction }: NavigationProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">FinanceAI</h1>
            </div>

            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onTabChange('transactions')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'transactions'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => onTabChange('budget')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'budget'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Budget
              </button>
              <button
                onClick={() => onTabChange('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => onTabChange('goals')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'goals'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Goals
              </button>
              <button
                onClick={() => onTabChange('ai-assistant')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'ai-assistant'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                AI Assistant
              </button>
              <button
                onClick={() => onTabChange('settings')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'settings'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onAddTransaction}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
            
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}