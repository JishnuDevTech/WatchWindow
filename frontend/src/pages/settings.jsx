import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import authService from '../services/authService';
import familyService from '../services/familyService';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        const families = await familyService.getUserFamilies();
        if (families.length > 0) {
          const currentFamily = familyService.getCurrentFamily() || families[0];
          setFamily(currentFamily);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleSignOut = () => {
    authService.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-safe py-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container-safe py-12">
        <div className="max-w-2xl space-y-6">
          {/* Profile Section */}
          {user && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Profile</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">
                      {user.name}
                    </p>
                    <p className="text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Email
                    </p>
                    <p className="text-slate-900">{user.email}</p>
                  </div>

                  {family && (
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Family
                      </p>
                      <p className="text-slate-900">{family.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
            </div>

            <div className="divide-y divide-slate-200">
              <button className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notifications</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage notification preferences
                  </p>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>

              <button className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Display Settings</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Customize how you see the schedule
                  </p>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>

              <button className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Privacy</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Control your privacy settings
                  </p>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">About</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Version</p>
                <p className="text-slate-900">0.1.0</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Tagline</p>
                <p className="text-slate-900">
                  Know your window. Own your watch.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600 mb-3">Links</p>
                <div className="space-y-2">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Privacy Policy
                  </button>
                  <button className="block text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Terms of Service
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-red-200">
              <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
            </div>

            <div className="p-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>

              <p className="text-sm text-red-600 mt-3">
                You'll be signed out of all devices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}