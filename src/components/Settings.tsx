import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  userId: string;
}

export function Settings({ userId }: SettingsProps) {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false,
  });

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Fetch all user data
      const [transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
      ]);

      const exportData = {
        transactions: transactionsRes.data || [],
        budgets: budgetsRes.data || [],
        goals: goalsRes.data || [],
        exportDate: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'This action cannot be undone. Type "DELETE" to confirm account deletion:'
    );
    
    if (confirmation === 'DELETE') {
      setLoading(true);
      try {
        // Delete all user data
        await Promise.all([
          supabase.from('transactions').delete().eq('user_id', userId),
          supabase.from('budgets').delete().eq('user_id', userId),
          supabase.from('goals').delete().eq('user_id', userId),
        ]);

        // Sign out user
        await signOut();
      } catch (error) {
        console.error('Error deleting account:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
      </div>

      {/* Profile Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
            <input
              type="text"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Budget Alerts</h3>
              <p className="text-sm text-gray-600">Get notified when you exceed budget limits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.budgetAlerts}
                onChange={(e) => setNotifications({ ...notifications, budgetAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Goal Reminders</h3>
              <p className="text-sm text-gray-600">Reminders to contribute to your financial goals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.goalReminders}
                onChange={(e) => setNotifications({ ...notifications, goalReminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Weekly Reports</h3>
              <p className="text-sm text-gray-600">Weekly summary of your financial activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">Data & Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Exporting...' : 'Export My Data'}
          </button>
          
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-800 mb-2">Danger Zone</h3>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">About</h2>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Support:</strong> Built with React, TypeScript, and Supabase</p>
        </div>
      </div>
    </div>
  );
}