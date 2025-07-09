export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  user_id: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  type: 'spending_pattern' | 'budget_alert' | 'saving_tip' | 'goal_progress';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  action_suggested?: string;
  created_at: string;
}