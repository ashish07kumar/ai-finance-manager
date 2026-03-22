import { useState, useEffect } from 'react';
import { budgetAPI } from '../api/axios';
import BudgetCard from '../components/BudgetCard';
import BudgetForm from '../components/BudgetForm';
import toast from 'react-hot-toast';
import { FiPlus, FiPieChart } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatCurrency';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetAPI.getAll();
      setBudgets(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (data) => {
    try {
      await budgetAPI.create(data);
      toast.success('Budget created successfully');
      setShowForm(false);
      fetchBudgets();
    } catch (error) {
      toast.error(error.message || 'Failed to create budget');
    }
  };

  const handleUpdateBudget = async (data) => {
    try {
      await budgetAPI.update(editingBudget._id, data);
      toast.success('Budget updated successfully');
      setEditingBudget(null);
      fetchBudgets();
    } catch (error) {
      toast.error(error.message || 'Failed to update budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await budgetAPI.delete(id);
      toast.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      toast.error(error.message || 'Failed to delete budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
  };

  const calculateTotals = () => {
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    return { totalLimit, totalSpent };
  };

  const { totalLimit, totalSpent } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">Set and track your monthly budgets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FiPieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-primary-100">Total Budget Limit</p>
              <p className="text-2xl font-bold">{formatCurrency(totalLimit)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FiPieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-red-100">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FiPieChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-100">Total Remaining</p>
              <p className="text-2xl font-bold">{formatCurrency(totalLimit - totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card text-center py-12">
          <FiPieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-600 mb-6">Create your first budget to start tracking your expenses</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Budget Form Modal */}
      {showForm && (
        <BudgetForm
          onSubmit={handleAddBudget}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingBudget && (
        <BudgetForm
          initialData={editingBudget}
          onSubmit={handleUpdateBudget}
          onClose={() => setEditingBudget(null)}
        />
      )}
    </div>
  );
};

export default Budgets;
