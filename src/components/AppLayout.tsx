import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import StudentDashboard from '@/components/student/StudentDashboard';
import RecruiterDashboard from '@/components/recruiter/RecruiterDashboard';
import { Sparkles, ArrowRight, Users, Briefcase, BookOpen, Award, Calendar, TrendingUp, CheckCircle, GraduationCap, Building2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return user.role === 'student' ? <StudentDashboard /> : <RecruiterDashboard />;
  }

  if (showLogin) {
    return <LoginPage onClose={() => setShowLogin(false)} />;
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">BridgeUP AI</span>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="px-5 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-cyan-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-300/30 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Bridge the Gap Between
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent"> Students & Recruiters</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              The intelligent platform where students showcase verified skills and recruiters discover top talent through our credit-based ranking system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <Building2 className="w-5 h-5" />
                For Recruiters
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '500+', label: 'Partner Companies' },
              { value: '15+', label: 'Skill Courses' },
              { value: '95%', label: 'Placement Rate' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-purple-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-purple-200 mb-4">
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">For Students</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Your Career Growth Hub</h2>
          <p className="text-purple-200 text-lg mb-12 max-w-2xl">
            Everything you need to land your dream internship - all in one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, title: 'Internship Tracker', desc: 'Kanban board to manage applications with AI-powered prep schedules' },
              { icon: BookOpen, title: 'Skill Library', desc: 'University-aligned courses to build skills and earn credits' },
              { icon: Calendar, title: 'Unified Calendar', desc: 'Track exams, hackathons, deadlines, and mentor meetings' },
              { icon: Award, title: 'Proof Gallery', desc: 'Showcase projects with photos, summaries, and contribution details' },
              { icon: Users, title: 'Mentor Connect', desc: 'Book sessions with industry experts and university mentors' },
              { icon: TrendingUp, title: 'Credit System', desc: 'Earn credits for courses, projects, and internships' }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-purple-200">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Recruiters Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-600 to-teal-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-cyan-200 mb-4">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">For Recruiters</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Find Top Talent Faster</h2>
          <p className="text-cyan-200 text-lg mb-12 max-w-2xl">
            Our credit-based ranking system surfaces the most qualified candidates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { title: 'Credit-Based Ranking', desc: 'Students ranked by verified achievements - courses, projects, and internships' },
                { title: 'Smart Search', desc: 'Filter by skills and see candidates with the highest credits first' },
                { title: 'Verified Profiles', desc: 'View GitHub, LinkedIn, LeetCode links and verified certificates' },
                { title: 'Project Details', desc: 'See exactly what each candidate contributed with proof of work' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                    <p className="text-cyan-200">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4">Credit Levels</h4>
              <div className="space-y-4">
                {[
                  { level: 'Expert', credits: '200+', color: 'bg-purple-500' },
                  { level: 'Advanced', credits: '100-199', color: 'bg-blue-500' },
                  { level: 'Intermediate', credits: '50-99', color: 'bg-green-500' },
                  { level: 'Beginner', credits: '0-49', color: 'bg-slate-400' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                      {item.level.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.level}</p>
                      <p className="text-cyan-200 text-sm">{item.credits} credits</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Transform Your Career Journey?</h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of students and recruiters already using BridgeUP AI.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">BridgeUP AI</span>
              </div>
              <p className="text-slate-400">
                Bridging the gap between students and recruiters with AI-powered career tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Internship Tracker</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Skill Library</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentor Connect</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Calendar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Recruiters</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Candidate Search</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Credit System</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Verified Profiles</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 BridgeUP AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default AppLayout;
