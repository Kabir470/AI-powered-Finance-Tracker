import { corsHeaders } from '../_shared/cors.ts';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

interface InsightRequest {
  transactions: Transaction[];
  timeframe: 'week' | 'month' | 'year';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions, timeframe }: InsightRequest = await req.json();

    // Calculate basic metrics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    // Category analysis
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)[0];

    // Generate AI insights
    const insights = [];

    // Spending pattern insight
    if (topExpenseCategory) {
      insights.push({
        type: 'spending_pattern',
        title: 'Top Expense Category',
        description: `Your highest expense category is ${topExpenseCategory[0]} with $${topExpenseCategory[1].toFixed(2)} spent this ${timeframe}.`,
        severity: 'medium' as const,
        action_suggested: `Consider setting a budget limit for ${topExpenseCategory[0]} to better control spending.`
      });
    }

    // Budget alert
    if (netIncome < 0) {
      insights.push({
        type: 'budget_alert',
        title: 'Spending Exceeds Income',
        description: `You've spent $${Math.abs(netIncome).toFixed(2)} more than you earned this ${timeframe}.`,
        severity: 'high' as const,
        action_suggested: 'Review your expenses and consider reducing spending in non-essential categories.'
      });
    }

    // Saving tip
    if (netIncome > 0) {
      const savingsRate = (netIncome / totalIncome) * 100;
      insights.push({
        type: 'saving_tip',
        title: 'Great Saving Progress',
        description: `You saved ${savingsRate.toFixed(1)}% of your income this ${timeframe}!`,
        severity: 'low' as const,
        action_suggested: savingsRate < 20 ? 'Consider increasing your savings rate to 20% for better financial health.' : 'Keep up the excellent saving habits!'
      });
    }

    // Expense trend analysis
    const dailyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const date = t.date.split('T')[0];
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const avgDailyExpense = Object.values(dailyExpenses).reduce((sum, val) => sum + val, 0) / Object.keys(dailyExpenses).length;
    const recentExpenses = Object.entries(dailyExpenses)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
      .map(([, amount]) => amount);

    const recentAvg = recentExpenses.reduce((sum, val) => sum + val, 0) / recentExpenses.length;

    if (recentAvg > avgDailyExpense * 1.2) {
      insights.push({
        type: 'spending_pattern',
        title: 'Increased Spending Detected',
        description: `Your recent daily spending is 20% higher than your average.`,
        severity: 'medium' as const,
        action_suggested: 'Review recent transactions and identify areas where you can reduce spending.'
      });
    }

    return new Response(
      JSON.stringify({
        insights,
        summary: {
          totalIncome,
          totalExpenses,
          netIncome,
          topExpenseCategory: topExpenseCategory ? topExpenseCategory[0] : null,
          savingsRate: totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : '0'
        }
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate insights' }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});