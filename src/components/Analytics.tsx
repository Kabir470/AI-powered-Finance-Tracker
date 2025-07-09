import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  userId: string;
}

export function Analytics({ userId }: AnalyticsProps) {
  const { transactions, loading } = useTransactions(userId);

  const analytics = useMemo(() => {
    if (!transactions.length) return null;

    // Monthly comparison
    const currentMonth = startOfMonth(new Date());
    const lastMonth = startOfMonth(subMonths(new Date(), 1));
    
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= currentMonth
    );
    const lastMonthTransactions = transactions.filter(t => 
      new Date(t.date) >= lastMonth && new Date(t.date) < currentMonth
    );

    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryData = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
      }));

    // Monthly trends (last 6 months)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(new Date(), 5 - i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= monthStart && date <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM yyyy'),
        income,
        expenses,
        net: income - expenses,
      };
    });

    // Daily spending pattern (last 30 days)
    const dailySpending = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayTransactions = transactions.filter(t => 
        format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: format(date, 'MMM dd'),
        expenses,
      };
    });

    return {
      currentMonth: {
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        net: currentMonthIncome - currentMonthExpenses,
      },
      lastMonth: {
        income: lastMonthIncome,
        expenses: lastMonthExpenses,
        net: lastMonthIncome - lastMonthExpenses,
      },
      categoryData: pieData,
      monthlyTrends,
      dailySpending,
    };
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No data to analyze</h3>
        <p className="text-gray-500">Add some transactions to see your financial analytics</p>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const incomeChange = analytics.lastMonth.income > 0 
    ? ((analytics.currentMonth.income - analytics.lastMonth.income) / analytics.lastMonth.income) * 100 
    : 0;
  
  const expenseChange = analytics.lastMonth.expenses > 0 
    ? ((analytics.currentMonth.expenses - analytics.lastMonth.expenses) / analytics.lastMonth.expenses) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Financial Analytics</h1>

      {/* Month-over-Month Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Monthly Income</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600 mb-2">
            ${analytics.currentMonth.income.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {incomeChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(incomeChange).toFixed(1)}%
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Monthly Expenses</h3>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600 mb-2">
            ${analytics.currentMonth.expenses.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {expenseChange <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(expenseChange).toFixed(1)}%
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Net Income</h3>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className={`text-2xl font-bold mb-2 ${analytics.currentMonth.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${analytics.currentMonth.net.toFixed(2)}
          </p>
          <div className="text-sm text-gray-500">
            Last month: ${analytics.lastMonth.net.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            6-Month Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Expense Categories
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Spending Pattern */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Daily Spending (Last 30 Days)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.dailySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expenses" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}