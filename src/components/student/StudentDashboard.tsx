import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, LayoutDashboard, Briefcase, BookOpen, Calendar, Image, Users, Award, LogOut, Menu, X, ChevronRight, TrendingUp, UserCircle } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import SkillLibrary from './SkillLibrary';
import UnifiedCalendar from './UnifiedCalendar';
import ProofGallery from './ProofGallery';
import MentorConnect from './MentorConnect';
import CertificateVault from './CertificateVault';
import ProfileEditor from './ProfileEditor';

type View = 'overview' | 'applications' | 'skills' | 'calendar' | 'gallery' | 'mentors' | 'certificates' | 'profile';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Edit Profile', icon: UserCircle },
  { id: 'applications', label: 'Internship Tracker', icon: Briefcase },
  { id: 'skills', label: 'Skill Library', icon: BookOpen },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'gallery', label: 'Proof Gallery', icon: Image },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'mentors', label: 'Mentor Connect', icon: Users }
];

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <ProfileEditor />;
      case 'applications':
        return <KanbanBoard />;
      case 'skills':
        return <SkillLibrary />;
      case 'calendar':
        return <UnifiedCalendar />;
      case 'gallery':
        return <ProofGallery />;
      case 'mentors':
        return <MentorConnect />;
      case 'certificates':
        return <CertificateVault />;
      default:
        return <OverviewContent setCurrentView={setCurrentView} />;
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <span className="font-bold text-slate-800">BridgeUP</span>
                  <p className="text-xs text-slate-500">Career Hub</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-600' : ''}`} />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.university || 'Student'}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg mb-3">
                <span className="text-xs text-purple-600">Total Credits</span>
                <span className="font-bold text-purple-700">{user?.total_credits || 0}</span>
              </div>
            )}
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
                  {navItems.find(n => n.id === currentView)?.label || 'Overview'}
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

// Overview Content Component
const OverviewContent: React.FC<{ setCurrentView: (view: View) => void }> = ({ setCurrentView }) => {
  const { user } = useAuth();

  const quickActions = [
    { id: 'applications', label: 'Track Applications', icon: Briefcase, color: 'from-blue-500 to-blue-600', desc: 'Manage your internship applications' },
    { id: 'skills', label: 'Learn Skills', icon: BookOpen, color: 'from-purple-500 to-purple-600', desc: 'Browse courses and earn credits' },
    { id: 'calendar', label: 'View Calendar', icon: Calendar, color: 'from-amber-500 to-orange-500', desc: 'Check upcoming events' },
    { id: 'gallery', label: 'Add Projects', icon: Image, color: 'from-green-500 to-emerald-500', desc: 'Showcase your work' },
    { id: 'certificates', label: 'Certificates', icon: Award, color: 'from-pink-500 to-rose-500', desc: 'Upload achievements' },
    { id: 'mentors', label: 'Book Mentor', icon: Users, color: 'from-cyan-500 to-teal-500', desc: 'Connect with experts' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to BridgeUP AI</h2>
            <p className="text-purple-100 max-w-lg">
              Your personalized career growth platform. Track applications, build skills, and connect with mentors.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Total Credits</p>
          <p className="text-2xl font-bold text-purple-600">{user?.total_credits || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Courses</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Projects</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Applications</p>
          <p className="text-2xl font-bold text-amber-600">0</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => setCurrentView(action.id as View)}
                className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">{action.label}</h4>
                    <p className="text-sm text-slate-500">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
