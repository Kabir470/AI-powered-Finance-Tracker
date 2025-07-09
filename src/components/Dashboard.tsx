import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { format, subDays, startOfMonth } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';
import { Pie } from 'recharts';

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const { transactions, loading } = useTransactions(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate financial metrics
  const currentMonth = startOfMonth(new Date());
  const monthlyTransactions = transactions.filter(t => new Date(t.date) >= currentMonth);
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dayTransactions = transactions.filter(t => 
      format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    return {
      date: format(date, 'MMM dd'),
      income: dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expenses: dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    };
  }).reverse();

  // Category breakdown
  const categoryData = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl">
        <h1 className="text-3xl font-bold mb-2">Financial Dashboard</h1>
        <p className="text-blue-100">
          Track your finances with AI-powered insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">${monthlyIncome.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">${monthlyExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Balance</p>
              <p className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${monthlyBalance.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${monthlyBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Income vs Expenses (Last 7 Days)
          </h3>
          <div className="h-64">
            <LineChart width={400} height={240} data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Expense Categories
          </h3>
          <div className="h-64 flex items-center justify-center">
            <RechartsPieChart width={240} height={240}>
              <Pie
                data={pieData}
                cx={120}
                cy={120}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold mb-4">AI Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Spending Pattern</h4>
            <p className="text-sm text-blue-700">
              Your highest expense category is {Object.keys(categoryData).sort((a, b) => categoryData[b] - categoryData[a])[0] || 'N/A'}. 
              Consider setting a budget for this category.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Saving Opportunity</h4>
            <p className="text-sm text-green-700">
              {monthlyBalance > 0 
                ? `Great job! You saved $${monthlyBalance.toFixed(2)} this month.`
                : 'Try to reduce expenses to improve your savings rate.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}