/*
  # Create Finance Tracker Database Schema

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (decimal)
      - `description` (text)
      - `category` (text)
      - `type` (text) - 'income' or 'expense'
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `color` (text)
      - `icon` (text)
      - `type` (text) - 'income' or 'expense'
      - `created_at` (timestamp)
    
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category` (text)
      - `amount` (decimal)
      - `spent` (decimal)
      - `period` (text) - 'weekly', 'monthly', 'yearly'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `target_amount` (decimal)
      - `current_amount` (decimal)
      - `target_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  icon text DEFAULT '📋',
  type text CHECK (type IN ('income', 'expense', 'both')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  amount decimal(10,2) NOT NULL,
  spent decimal(10,2) DEFAULT 0,
  period text CHECK (period IN ('weekly', 'monthly', 'yearly')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0,
  target_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can manage their own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for categories
CREATE POLICY "Users can manage their own categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for budgets
CREATE POLICY "Users can manage their own budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for goals
CREATE POLICY "Users can manage their own goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();