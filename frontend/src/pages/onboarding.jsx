import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, AlertCircle, Check } from 'lucide-react';
import familyService from '../services/familyService';

export default function Onboarding() {
  const [step, setStep] = useState('choice'); // choice, create, join
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await familyService.createFamily(familyName, 'Our household TV schedule');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await familyService.joinFamily(inviteCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome!</h1>
          <p className="text-slate-600 mt-2">
            Set up your family TV schedule
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 'choice' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                What would you like to do?
              </h2>

              <button
                onClick={() => setStep('create')}
                className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Create a new family
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Start fresh with your household
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('join')}
                className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Join existing family
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Enter a family invite code
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 'create' && (
            <div>
              <button
                onClick={() => setStep('choice')}
                className="text-sm text-slate-600 hover:text-slate-900 mb-4"
              >
                ← Back
              </button>

              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Create Your Family
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle
                    size={20}
                    className="text-red-600 flex-shrink-0"
                  />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateFamily} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Family Name
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g., The Smiths"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Family'}
                </button>
              </form>
            </div>
          )}

          {step === 'join' && (
            <div>
              <button
                onClick={() => setStep('choice')}
                className="text-sm text-slate-600 hover:text-slate-900 mb-4"
              >
                ← Back
              </button>

              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Join a Family
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle
                    size={20}
                    className="text-red-600 flex-shrink-0"
                  />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleJoinFamily} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) =>
                      setInviteCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g., SMITH123"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Ask a family member for the invite code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Joining...' : 'Join Family'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}