import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { Budget } from './components/Budget';
import { Analytics } from './components/Analytics';
import { Goals } from './components/Goals';
import { AIAssistant } from './components/AIAssistant';
import { Settings } from './components/Settings';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTransaction={() => setShowTransactionForm(true)}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard userId={user.id} />}
        {activeTab === 'transactions' && <TransactionList userId={user.id} />}
        {activeTab === 'budget' && <Budget userId={user.id} />}
        {activeTab === 'analytics' && <Analytics userId={user.id} />}
        {activeTab === 'goals' && <Goals userId={user.id} />}
        {activeTab === 'ai-assistant' && <AIAssistant userId={user.id} />}
        {activeTab === 'settings' && <Settings userId={user.id} />}
      </div>

      {showTransactionForm && (
        <TransactionForm
          userId={user.id}
          onClose={() => setShowTransactionForm(false)}
        />
      )}
    </div>
  );
}

export default App;