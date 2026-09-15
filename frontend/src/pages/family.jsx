import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Plus, Mail, X, UsersRound } from 'lucide-react';
import familyService from '../services/familyService';

export default function Family() {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const families = await familyService.getUserFamilies();
        if (families.length === 0) {
          navigate('/onboarding');
          return;
        }

        const currentFamily = familyService.getCurrentFamily() || families[0];
        setFamily(currentFamily);

        const familyMembers = await familyService.getFamilyMembers(
          currentFamily.id
        );
        setMembers(familyMembers || []);

        const code = await familyService.getInviteCode(currentFamily.id);
        setInviteCode(code);
      } catch (err) {
        console.error('Failed to load family:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setError('');

    if (!family) return;

    try {
      await familyService.inviteMember(family.id, inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
      // In a real app, show confirmation message
    } catch (err) {
      setError(err.message || 'Failed to send invite');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading family...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600">No family found</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Set up family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-safe py-8">
          <h1 className="text-3xl font-bold text-slate-900">Family Members</h1>
          <p className="text-slate-600 mt-2">{family.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-safe py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Members</h2>
                <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </span>
              </div>

              {members.length === 0 ? (
                <div className="p-12 text-center">
                  <UsersRound className="text-slate-300 mx-auto mb-4" size={48} />
                  <p className="text-slate-600 mb-4">No members yet</p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Invite first member →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center text-lg font-semibold">
                            {(member.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {member.name}
                            </h3>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                            {member.role}
                          </span>
                          {member.joinedAt && (
                            <p className="text-xs text-slate-500 mt-2">
                              Joined{' '}
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite New Member */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus size={20} />
                Invite Member
              </h3>
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Send Invite
              </button>
              <p className="text-xs text-slate-500 mt-4 text-center">
                or share the code below
              </p>
            </div>

            {/* Invite Code */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Family Code</h3>
              <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Share with family</p>
                  <p className="font-mono font-bold text-2xl text-slate-900 tracking-wider">
                    {inviteCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                  title="Copy code"
                >
                  {copied ? (
                    <Check size={20} className="text-green-600" />
                  ) : (
                    <Copy size={20} className="text-slate-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Anyone with this code can join your family
              </p>
            </div>

            {/* Family Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
              <p className="text-blue-900">
                <strong>Tip:</strong> Keep your family code private and share it
                only with trusted family members.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="dialog-content w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Invite Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500">
                They'll receive an email to join your family schedule
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}