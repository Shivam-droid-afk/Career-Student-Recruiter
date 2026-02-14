import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, LayoutDashboard, Search, Users, LogOut, Menu, X, TrendingUp, Award, Briefcase, Target } from 'lucide-react';
import CandidateSearch from './CandidateSearch';
import CandidateProfile from './CandidateProfile';

interface Candidate {
  id: string;
  full_name: string;
  email?: string;
  university?: string;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  gfg_url?: string;
  bio?: string;
  total_credits: number;
}

type View = 'overview' | 'search' | 'profile';

const RecruiterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCurrentView('profile');
  };

  const handleBackToSearch = () => {
    setSelectedCandidate(null);
    setCurrentView('search');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'search', label: 'Candidate Search', icon: Search }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return <CandidateSearch onSelectCandidate={handleSelectCandidate} />;
      case 'profile':
        return selectedCandidate ? (
          <CandidateProfile candidate={selectedCandidate} onBack={handleBackToSearch} />
        ) : (
          <CandidateSearch onSelectCandidate={handleSelectCandidate} />
        );
      default:
        return <RecruiterOverview setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <span className="font-bold text-slate-800">BridgeUP</span>
                  <p className="text-xs text-slate-500">Recruiter Portal</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (currentView === 'profile' && item.id === 'search');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-600' : ''}`} />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user?.full_name?.charAt(0) || 'R'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.company || 'Recruiter'}</p>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span className="text-sm">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {currentView === 'profile' ? 'Candidate Profile' : navItems.find(n => n.id === currentView)?.label || 'Overview'}
                </h1>
                <p className="text-sm text-slate-500">
                  Welcome back, {user?.full_name?.split(' ')[0]}!
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Recruiter Overview Component
const RecruiterOverview: React.FC<{ setCurrentView: (view: View) => void }> = ({ setCurrentView }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to BridgeUP Recruiter Portal</h2>
            <p className="text-cyan-100 max-w-lg">
              Find top talent ranked by verified credits, skills, and real project experience.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* How Credits Work */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          How the Credit System Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">Courses</h4>
            <p className="text-sm text-slate-500">Students earn 8-20 credits per completed course</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">Projects</h4>
            <p className="text-sm text-slate-500">25 credits for each documented project with proof</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">Internships</h4>
            <p className="text-sm text-slate-500">50 credits for verified internship experience</p>
          </div>
        </div>
      </div>

      {/* Credit Levels */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Credit Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-slate-100">
            <div className="w-12 h-12 bg-slate-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
              B
            </div>
            <p className="font-medium text-slate-800">Beginner</p>
            <p className="text-sm text-slate-500">0-49 credits</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-green-50">
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
              I
            </div>
            <p className="font-medium text-slate-800">Intermediate</p>
            <p className="text-sm text-slate-500">50-99 credits</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-blue-50">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
              A
            </div>
            <p className="font-medium text-slate-800">Advanced</p>
            <p className="text-sm text-slate-500">100-199 credits</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-purple-50">
            <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
              E
            </div>
            <p className="font-medium text-slate-800">Expert</p>
            <p className="text-sm text-slate-500">200+ credits</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to find your next hire?</h3>
            <p className="text-slate-300">Search candidates by skills and see their verified achievements.</p>
          </div>
          <button
            onClick={() => setCurrentView('search')}
            className="px-6 py-3 bg-white text-slate-800 rounded-xl font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search Candidates
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
