import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../api/axios';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatCurrency';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [categoryResponse, monthlyResponse] = await Promise.all([
        analyticsAPI.getCategory(dateRange),
        analyticsAPI.getMonthly(dateRange),
      ]);
      
      setCategoryData(categoryResponse.data.data);
      setMonthlyData(monthlyResponse.data.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const COLORS = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];

  const formatMonthlyData = () => {
    return monthlyData.map((item) => ({
      month: new Date(0, item.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      income: item.income,
      expense: item.expense,
      net: item.net,
    }));
  };

  const calculateTotals = () => {
    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
    const netSavings = totalIncome - totalExpense;
    return { totalIncome, totalExpense, netSavings };
  };

  const { totalIncome, totalExpense, netSavings } = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Visualize your financial data</p>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-100">Total Income</p>
              <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-red-100">Total Expense</p>
              <p className="text-2xl font-bold">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>

        <div className={`card bg-gradient-to-br ${netSavings >= 0 ? 'from-primary-500 to-primary-600' : 'from-gray-500 to-gray-600'} text-white`}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-primary-100">Net Savings</p>
              <p className="text-2xl font-bold">{formatCurrency(netSavings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Pie Chart */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <FiPieChart className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
          </div>
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No category data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                  outerRadius={100}
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
          )}
        </div>

        {/* Category Bar Chart */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <FiBarChart2 className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
          </div>
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No category data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <FiTrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Income vs Expense Trend</h3>
        </div>
        {monthlyData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No monthly data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formatMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                strokeWidth={2}
                name="Expense"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Net"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analytics;
