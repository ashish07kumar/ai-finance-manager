import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI, transactionAPI } from '../api/axios';
import { formatCurrency, formatDate, getTransactionTypeColor } from '../utils/formatCurrency';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { getSocket } from '../utils/socket';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryRes, categoryRes, monthlyRes, transactionsRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getCategory({ type: 'expense' }),
        analyticsAPI.getMonthly(),
        transactionAPI.getAll({ limit: 5, sort: '-date' }),
      ]);

      setSummary(summaryRes.data.data);
      setCategoryData(categoryRes.data.data.categories);
      setMonthlyData(monthlyRes.data.data.months);
      setRecentTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = getSocket();
    socket.emit('join-user', user._id);

    const refresh = () => fetchDashboardData();

    socket.on('transaction:created', refresh);
    socket.on('transaction:updated', refresh);
    socket.on('transaction:deleted', refresh);
    socket.on('budget:created', refresh);
    socket.on('budget:updated', refresh);
    socket.on('budget:deleted', refresh);

    return () => {
      socket.off('transaction:created', refresh);
      socket.off('transaction:updated', refresh);
      socket.off('transaction:deleted', refresh);
      socket.off('budget:created', refresh);
      socket.off('budget:updated', refresh);
      socket.off('budget:deleted', refresh);
    };
  }, [user?._id, fetchDashboardData]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(summary?.totalIncome || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {summary?.incomeTransactions || 0} transactions
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(summary?.totalExpense || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiTrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {summary?.expenseTransactions || 0} transactions
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Balance</p>
              <p className={`text-2xl font-bold mt-1 ${summary?.balance >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.balance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Current month
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Savings Rate</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {summary?.savingsRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiPieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Of your income
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No monthly data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <a href="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </a>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{transaction.category}</p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                  {transaction.note && (
                    <p className="text-xs text-gray-400 mt-1">{transaction.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getTransactionTypeColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Start by adding one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
