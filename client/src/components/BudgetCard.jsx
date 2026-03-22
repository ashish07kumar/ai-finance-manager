import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatCurrency';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const spent = budget.spent || 0;
  const limit = budget.limit;
  const remaining = limit - spent;
  const percentage = (spent / limit) * 100;

  const getStatusColor = () => {
    if (percentage >= 100) return 'red';
    if (percentage >= 80) return 'yellow';
    return 'green';
  };

  const getProgressBarColor = () => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  const getStatusBadge = () => {
    if (percentage >= 100) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Exceeded
        </span>
      );
    }
    if (percentage >= 80) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Good
      </span>
    );
  };

  const formatMonth = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
          <p className="text-sm text-gray-500">{formatMonth(budget.month, budget.year)}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <button
            onClick={() => onEdit(budget)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(budget._id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Budget Limit</span>
          <span className="font-semibold text-gray-900">{formatCurrency(limit)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Spent</span>
          <span className={`font-semibold ${getStatusColor() === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(spent)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Remaining</span>
          <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(remaining)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-medium">{Math.min(percentage, 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all ${getProgressBarColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Warning Message */}
        {percentage >= 80 && percentage < 100 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ You&apos;ve used {percentage.toFixed(0)}% of your budget
            </p>
          </div>
        )}

        {percentage >= 100 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800">
              🚫 Budget exceeded by {formatCurrency(Math.abs(remaining))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
