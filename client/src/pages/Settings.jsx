import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiBell, FiShield, FiSave } from 'react-icons/fi';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateUser({ currency });
    setLoading(false);

    if (result.success) {
      toast.success('Settings saved');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <FiShield className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Account Preferences</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-field"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="JPY">JPY (¥) - Japanese Yen</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
              <option value="AUD">AUD ($) - Australian Dollar</option>
            </select>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <FiBell className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-800">Email notifications</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4 text-primary-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-800">Weekly summary email</span>
            <input
              type="checkbox"
              checked={weeklySummary}
              onChange={(e) => setWeeklySummary(e.target.checked)}
              className="h-4 w-4 text-primary-600"
            />
          </label>

          <p className="text-xs text-gray-500">
            Notification toggles are saved locally in this demo and can be connected to backend preferences later.
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn-primary inline-flex items-center gap-2"
      >
        <FiSave className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default Settings;
