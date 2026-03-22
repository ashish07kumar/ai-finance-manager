import { useState, useEffect, useCallback } from 'react';
import { transactionAPI } from '../api/axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import toast from 'react-hot-toast';
import { FiPlus, FiFilter } from 'react-icons/fi';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sort: '-date',
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await transactionAPI.getAll(params);
      setTransactions(response.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.totalTransactions,
      }));
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddTransaction = async (data) => {
    try {
      await transactionAPI.create(data);
      toast.success('Transaction added successfully');
      setShowForm(false);
      fetchTransactions();
    } catch (error) {
      toast.error(error.message || 'Failed to add transaction');
    }
  };

  const handleUpdateTransaction = async (data) => {
    try {
      await transactionAPI.update(editingTransaction._id, data);
      toast.success('Transaction updated successfully');
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      toast.error(error.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await transactionAPI.delete(id);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction({
      ...transaction,
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Rent">Rent</option>
              <option value="Shopping">Shopping</option>
              <option value="Salary">Salary</option>
              <option value="Investment">Investment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDeleteTransaction}
          loading={loading}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {transactions.length} of {pagination.total} transactions
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          onSubmit={handleAddTransaction}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingTransaction && (
        <TransactionForm
          initialData={editingTransaction}
          onSubmit={handleUpdateTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default Transactions;
