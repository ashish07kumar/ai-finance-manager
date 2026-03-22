const Budget = require('../../../models/Budget');
const Account = require('../../../models/Account');
const cache = require('../../services/cache.service');
const repo = require('./analytics.repository');

function monthRange(date) {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
  };
}

function getScore({ savingsRate, budgetOverages, expenseToIncomeRatio }) {
  let score = 100;
  if (savingsRate < 20) score -= 20;
  if (savingsRate < 10) score -= 20;
  score -= Math.min(20, budgetOverages * 10);
  if (expenseToIncomeRatio > 0.9) score -= 15;
  if (expenseToIncomeRatio > 1) score -= 20;
  return Math.max(0, Math.min(100, score));
}

const analyticsService = {
  async getSummary(userId, query) {
    const now = new Date();
    const startDate = query.startDate ? new Date(query.startDate) : monthRange(now).start;
    const endDate = query.endDate ? new Date(query.endDate) : monthRange(now).end;

    const cacheKey = `dashboard:${userId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const summaryRows = await repo.aggregateSummary(userId, startDate, endDate);
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeTransactions = 0;
    let expenseTransactions = 0;

    for (const row of summaryRows) {
      if (row._id === 'income') {
        totalIncome = row.total;
        incomeTransactions = row.count;
      }
      if (row._id === 'expense') {
        totalExpense = row.total;
        expenseTransactions = row.count;
      }
    }

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Number((((balance) / totalIncome) * 100).toFixed(2)) : 0;

    const result = {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      incomeTransactions,
      expenseTransactions,
      period: { startDate, endDate },
    };

    await cache.set(cacheKey, result, 120);
    return result;
  },

  async getCategoryAnalytics(userId, query) {
    const now = new Date();
    const startDate = query.startDate ? new Date(query.startDate) : monthRange(now).start;
    const endDate = query.endDate ? new Date(query.endDate) : monthRange(now).end;
    const type = query.type || 'expense';

    const cacheKey = `analytics:${userId}:category:${type}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const rows = await repo.aggregateCategory(userId, startDate, endDate, type);
    const total = rows.reduce((sum, r) => sum + r.total, 0);

    const result = {
      type,
      categories: rows.map((row) => ({
        category: row._id,
        total: row.total,
        count: row.count,
        percentage: total ? Number(((row.total / total) * 100).toFixed(2)) : 0,
      })),
      total,
      period: { startDate, endDate },
    };

    await cache.set(cacheKey, result, 180);
    return result;
  },

  async getAccountAnalytics(userId, query) {
    const now = new Date();
    const startDate = query.startDate ? new Date(query.startDate) : monthRange(now).start;
    const endDate = query.endDate ? new Date(query.endDate) : monthRange(now).end;

    const [rows, accounts] = await Promise.all([
      repo.aggregateByAccount(userId, startDate, endDate),
      Account.find({ userId }).lean(),
    ]);

    const byId = new Map(accounts.map((a) => [String(a._id), a]));
    const result = {};

    for (const row of rows) {
      const accountId = String(row._id.accountId);
      if (!result[accountId]) {
        const account = byId.get(accountId);
        result[accountId] = {
          accountId,
          accountName: account?.name || 'Unknown account',
          accountType: account?.type || 'unknown',
          currency: account?.currency || 'USD',
          income: 0,
          expense: 0,
          net: 0,
          transactions: 0,
        };
      }
      result[accountId][row._id.type] = row.total;
      result[accountId].transactions += row.count;
    }

    const accountsData = Object.values(result).map((item) => ({
      ...item,
      net: item.income - item.expense,
    }));

    return {
      period: { startDate, endDate },
      accounts: accountsData,
      totals: accountsData.reduce((acc, item) => ({
        income: acc.income + item.income,
        expense: acc.expense + item.expense,
        net: acc.net + item.net,
      }), { income: 0, expense: 0, net: 0 }),
    };
  },

  async getMonthlyAnalytics(userId, query) {
    const year = Number(query.year || new Date().getFullYear());
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const cacheKey = `analytics:${userId}:monthly:${year}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const rows = await repo.aggregateMonthly(userId, start, end);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: monthNames[i],
      income: 0,
      expense: 0,
      net: 0,
    }));

    for (const row of rows) {
      const index = row._id.month - 1;
      months[index][row._id.type] = row.total;
    }

    for (const m of months) {
      m.net = m.income - m.expense;
    }

    const result = {
      year,
      months,
      yearTotals: months.reduce((acc, m) => ({
        income: acc.income + m.income,
        expense: acc.expense + m.expense,
        balance: acc.balance + m.net,
      }), { income: 0, expense: 0, balance: 0 }),
    };

    await cache.set(cacheKey, result, 300);
    return result;
  },

  async getAdvanced(userId) {
    const now = new Date();
    const currentRange = monthRange(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousRange = monthRange(prevDate);

    const [currentSummary, previousSummary, currentCategory] = await Promise.all([
      this.getSummary(userId, currentRange),
      this.getSummary(userId, previousRange),
      this.getCategoryAnalytics(userId, currentRange),
    ]);

    const budgetDocs = await Budget.find({ userId, month: now.getMonth() + 1, year: now.getFullYear() });
    const overages = budgetDocs.filter((b) => {
      const cat = currentCategory.categories.find((c) => c.category === b.category);
      return cat && cat.total > b.limit;
    }).length;

    const expenseToIncomeRatio = currentSummary.totalIncome > 0
      ? currentSummary.totalExpense / currentSummary.totalIncome
      : 1;

    const healthScore = getScore({
      savingsRate: currentSummary.savingsRate,
      budgetOverages: overages,
      expenseToIncomeRatio,
    });

    const monthOverMonth = {
      incomeDelta: currentSummary.totalIncome - previousSummary.totalIncome,
      expenseDelta: currentSummary.totalExpense - previousSummary.totalExpense,
      savingsRateDelta: currentSummary.savingsRate - previousSummary.savingsRate,
    };

    return {
      currentSummary,
      previousSummary,
      categoryBreakdown: currentCategory,
      financialHealthScore: healthScore,
      monthOverMonth,
    };
  },

  async getTrends(userId) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const rows = await repo.aggregateMonthly(userId, start, end);
    return rows;
  },

  async getInsights(userId) {
    const advanced = await this.getAdvanced(userId);
    const insights = [];

    if (advanced.monthOverMonth.expenseDelta > 0) {
      const previous = advanced.previousSummary.totalExpense || 1;
      const pct = ((advanced.monthOverMonth.expenseDelta / previous) * 100).toFixed(1);
      insights.push(`Spending increased ${pct}% compared to last month.`);
    }

    const now = new Date();
    const budgets = await Budget.find({ userId, month: now.getMonth() + 1, year: now.getFullYear() });
    const budgetByCategory = new Map(budgets.map((b) => [b.category, b]));

    for (const category of advanced.categoryBreakdown.categories) {
      const budget = budgetByCategory.get(category.category);
      if (budget && category.total > budget.limit) {
        insights.push(`You exceeded your ${category.category} budget.`);
      }
    }

    const topCategory = advanced.categoryBreakdown.categories[0];
    if (topCategory) {
      insights.push(`Highest spending category this month is ${topCategory.category} (${topCategory.total.toFixed(2)}).`);
    }

    if (advanced.currentSummary.savingsRate < 20) {
      insights.push('Your savings rate dropped below the recommended 20%.');
    }

    if (insights.length === 0) {
      insights.push('Your finances look stable this month. Keep tracking consistently.');
    }

    return {
      generatedAt: new Date(),
      insights,
      financialHealthScore: advanced.financialHealthScore,
    };
  },

  async getFinancialHealth(userId, query = {}) {
    const now = new Date();
    const startDate = query.startDate ? new Date(query.startDate) : monthRange(now).start;
    const endDate = query.endDate ? new Date(query.endDate) : monthRange(now).end;
    const cacheKey = `analytics:${userId}:financial-health:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const summary = await this.getSummary(userId, query);
    const categories = await this.getCategoryAnalytics(userId, { ...query, type: 'expense' });
    const month = query.month ? Number(query.month) : now.getMonth() + 1;
    const year = query.year ? Number(query.year) : now.getFullYear();

    const budgets = await Budget.find({ userId, month, year });
    const categoryMap = new Map(categories.categories.map((c) => [c.category, c]));

    let budgetHealthScore = 100;
    let exceededCount = 0;

    for (const budget of budgets) {
      const spent = categoryMap.get(budget.category)?.total || 0;
      const ratio = budget.limit > 0 ? spent / budget.limit : 0;
      if (ratio > 1) {
        exceededCount += 1;
        budgetHealthScore -= 20;
      } else if (ratio >= 0.8) {
        budgetHealthScore -= 10;
      }
    }

    budgetHealthScore = Math.max(0, budgetHealthScore);
    const expenseToIncomeRatio = summary.totalIncome > 0
      ? Number((summary.totalExpense / summary.totalIncome).toFixed(4))
      : 1;
    const topSpendingCategory = categories.categories[0]?.category || null;

    const result = {
      period: summary.period,
      savingsRate: summary.savingsRate,
      expenseToIncomeRatio,
      topSpendingCategory,
      monthlyNetBalance: summary.balance,
      budgetHealthScore,
      budgetsExceeded: exceededCount,
    };

    await cache.set(cacheKey, result, 180);
    return result;
  },
};

module.exports = analyticsService;
