import React, { useState, useEffect } from 'react';
import { Bot, Send, Lightbulb, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { supabase } from '../lib/supabase';
import { format, subDays, startOfMonth } from 'date-fns';

interface AIAssistantProps {
  userId: string;
}

interface AIInsight {
  type: 'spending_pattern' | 'budget_alert' | 'saving_tip' | 'goal_progress';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  action_suggested?: string;
}

export function AIAssistant({ userId }: AIAssistantProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'ai'; message: string }>>([]);
  const { transactions } = useTransactions(userId);

  useEffect(() => {
    generateInsights();
  }, [transactions]);

  const generateInsights = async () => {
    if (!transactions.length) {
      setLoading(false);
      return;
    }

    try {
      // Call the AI insights edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: transactions.slice(0, 100), // Limit to recent transactions
          timeframe: 'month'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      } else {
        // Fallback to local insights generation
        generateLocalInsights();
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      generateLocalInsights();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalInsights = () => {
    const currentMonth = startOfMonth(new Date());
    const monthlyTransactions = transactions.filter(t => new Date(t.date) >= currentMonth);
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const localInsights: AIInsight[] = [];

    // Spending pattern analysis
    const expensesByCategory = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)[0];

    if (topCategory) {
      localInsights.push({
        type: 'spending_pattern',
        title: 'Top Expense Category',
        description: `Your highest expense category this month is ${topCategory[0]} with $${topCategory[1].toFixed(2)} spent.`,
        severity: 'medium',
        action_suggested: `Consider setting a budget limit for ${topCategory[0]} to better control spending.`
      });
    }

    // Budget alert
    if (monthlyExpenses > monthlyIncome) {
      localInsights.push({
        type: 'budget_alert',
        title: 'Spending Exceeds Income',
        description: `You've spent $${(monthlyExpenses - monthlyIncome).toFixed(2)} more than you earned this month.`,
        severity: 'high',
        action_suggested: 'Review your expenses and consider reducing spending in non-essential categories.'
      });
    }

    // Saving tip
    if (monthlyIncome > monthlyExpenses) {
      const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
      localInsights.push({
        type: 'saving_tip',
        title: 'Great Saving Progress',
        description: `You saved ${savingsRate.toFixed(1)}% of your income this month!`,
        severity: 'low',
        action_suggested: savingsRate < 20 ? 'Consider increasing your savings rate to 20% for better financial health.' : 'Keep up the excellent saving habits!'
      });
    }

    setInsights(localInsights);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatHistory(prev => [...prev, { type: 'user', message: chatMessage }]);
    
    // Simple AI responses based on keywords
    let aiResponse = "I'm here to help with your finances! ";
    
    if (chatMessage.toLowerCase().includes('budget')) {
      aiResponse += "Based on your spending patterns, I recommend setting up budgets for your top expense categories. This will help you track and control your spending more effectively.";
    } else if (chatMessage.toLowerCase().includes('save')) {
      aiResponse += "To improve your savings, try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. You can also automate your savings to make it easier.";
    } else if (chatMessage.toLowerCase().includes('invest')) {
      aiResponse += "Before investing, make sure you have an emergency fund covering 3-6 months of expenses. Then consider low-cost index funds for long-term growth.";
    } else {
      aiResponse += "I can help you with budgeting, saving strategies, expense tracking, and financial goal setting. What specific area would you like to focus on?";
    }

    setTimeout(() => {
      setChatHistory(prev => [...prev, { type: 'ai', message: aiResponse }]);
    }, 1000);

    setChatMessage('');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_pattern':
        return <TrendingUp className="w-5 h-5" />;
      case 'budget_alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'saving_tip':
        return <Lightbulb className="w-5 h-5" />;
      case 'goal_progress':
        return <Target className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">AI Financial Assistant</h1>
      </div>

      {/* AI Insights */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Insights</h2>
        
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Add some transactions to get personalized AI insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{insight.title}</h3>
                    <p className="text-sm mb-2">{insight.description}</p>
                    {insight.action_suggested && (
                      <p className="text-sm font-medium">
                        💡 Suggestion: {insight.action_suggested}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat with AI Assistant</h2>
        
        <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-8 h-8 mx-auto mb-2" />
              <p>Ask me anything about your finances!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      chat.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    <p className="text-sm">{chat.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Ask about budgeting, saving, investing..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}