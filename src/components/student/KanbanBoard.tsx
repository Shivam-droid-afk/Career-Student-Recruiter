import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, GripVertical, Calendar, Building2, Briefcase, Sparkles, X, ChevronRight, Clock, BookOpen, Target, Lightbulb } from 'lucide-react';

interface Application {
  id: string;
  company_name: string;
  position: string;
  job_description?: string;
  status: 'wishlist' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  ai_prep_schedule?: any;
  notes?: string;
  applied_date?: string;
  deadline?: string;
}

interface PrepDay {
  day: number;
  title: string;
  focus: string;
  tasks: string[];
  resources: string[];
  timeEstimate: string;
}

const statusColumns = [
  { id: 'wishlist', title: 'Wishlist', color: 'bg-slate-500', lightColor: 'bg-slate-500/20' },
  { id: 'applied', title: 'Applied', color: 'bg-blue-500', lightColor: 'bg-blue-500/20' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-amber-500', lightColor: 'bg-amber-500/20' },
  { id: 'offered', title: 'Offered', color: 'bg-green-500', lightColor: 'bg-green-500/20' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500', lightColor: 'bg-red-500/20' }
];

// Fallback prep schedule generator
const generateFallbackSchedule = (position: string, company: string) => ({
  schedule: [
    { day: 1, title: "Company Research", focus: `Understanding ${company}`, tasks: [`Research ${company} history and mission`, "Study recent news and announcements", "Review products/services and competitors"], resources: ["Company website", "LinkedIn", "Glassdoor"], timeEstimate: "2 hours" },
    { day: 2, title: "Technical Fundamentals", focus: "Core technical skills", tasks: ["Review data structures and algorithms", "Practice coding problems on LeetCode", "Study relevant technologies from job description"], resources: ["LeetCode", "HackerRank", "Documentation"], timeEstimate: "3 hours" },
    { day: 3, title: "Deep Dive Technical", focus: "Advanced problem solving", tasks: ["Solve medium/hard coding problems", "Review past projects for discussion points", "Prepare technical examples and explanations"], resources: ["GitHub portfolio", "Technical blogs", "System design resources"], timeEstimate: "3 hours" },
    { day: 4, title: "Behavioral Preparation", focus: "STAR method stories", tasks: ["Prepare 5 STAR method stories", "Practice leadership and teamwork examples", "Review conflict resolution scenarios"], resources: ["Interview guides", "STAR method templates"], timeEstimate: "2 hours" },
    { day: 5, title: "Mock Interviews", focus: "Practice sessions", tasks: ["Complete technical mock interview", "Complete behavioral mock interview", "Get feedback and iterate"], resources: ["Pramp", "Interviewing.io", "Peers"], timeEstimate: "3 hours" },
    { day: 6, title: "Final Review", focus: "Consolidation", tasks: ["Review weak areas identified in mocks", "Prepare thoughtful questions for interviewer", "Finalize logistics and test setup"], resources: ["Notes", "Calendar", "Interview checklist"], timeEstimate: "2 hours" },
    { day: 7, title: "Rest & Confidence", focus: "Mental preparation", tasks: ["Light review of key concepts only", "Get good sleep (8+ hours)", "Prepare outfit and test equipment"], resources: ["Meditation apps", "Light reading"], timeEstimate: "1 hour" }
  ],
  keySkills: ["Problem Solving", "Communication", "Technical Knowledge", "Collaboration"],
  interviewTips: [
    "Be specific with examples - use the STAR method",
    "Ask clarifying questions before diving into solutions",
    "Show enthusiasm for the role and company",
    "Think out loud during technical problems",
    "Have 3-5 thoughtful questions prepared for the interviewer"
  ]
});

const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
  const [draggedApp, setDraggedApp] = useState<Application | null>(null);

  const [newApp, setNewApp] = useState({
    company_name: '',
    position: '',
    job_description: '',
    deadline: ''
  });

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setApplications(data);
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase
      .from('applications')
      .insert({
        student_id: user.id,
        company_name: newApp.company_name,
        position: newApp.position,
        job_description: newApp.job_description,
        deadline: newApp.deadline || null,
        status: 'wishlist',
        applied_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (data) {
      setApplications([data, ...applications]);
      setShowAddModal(false);
      setNewApp({ company_name: '', position: '', job_description: '', deadline: '' });
    }
  };

  const handleDragStart = (app: Application) => {
    setDraggedApp(app);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: string) => {
    if (!draggedApp || draggedApp.status === status) {
      setDraggedApp(null);
      return;
    }

    const updatedApps = applications.map(app =>
      app.id === draggedApp.id ? { ...app, status: status as Application['status'] } : app
    );
    setApplications(updatedApps);

    await supabase
      .from('applications')
      .update({ status })
      .eq('id', draggedApp.id);

    setDraggedApp(null);
  };

  const generateAIPrep = async (app: Application) => {
    setSelectedApp(app);
    setShowPrepModal(true);
    setIsGeneratingPrep(true);

    try {
      // Try to call the edge function with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 10000)
      );

      const fetchPromise = supabase.functions.invoke('generate-ai-prep', {
        body: {
          jobDescription: app.job_description || `${app.position} role at ${app.company_name}`,
          position: app.position,
          company: app.company_name
        }
      });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (data?.prepSchedule) {
        const updatedApp = { ...app, ai_prep_schedule: data.prepSchedule };
        setSelectedApp(updatedApp);

        await supabase
          .from('applications')
          .update({ ai_prep_schedule: data.prepSchedule })
          .eq('id', app.id);

        setApplications(applications.map(a => a.id === app.id ? updatedApp : a));
      } else {
        throw new Error('No data received');
      }
    } catch (err) {
      // Use fallback schedule
      console.log('Using fallback schedule');
      const fallbackSchedule = generateFallbackSchedule(app.position, app.company_name);
      const updatedApp = { ...app, ai_prep_schedule: fallbackSchedule };
      setSelectedApp(updatedApp);

      await supabase
        .from('applications')
        .update({ ai_prep_schedule: fallbackSchedule })
        .eq('id', app.id);

      setApplications(applications.map(a => a.id === app.id ? updatedApp : a));
    } finally {
      setIsGeneratingPrep(false);
    }
  };

  const getColumnApps = (status: string) =>
    applications.filter(app => app.status === status);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Internship Tracker</h2>
          <p className="text-slate-500">Track your applications and prepare with AI</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Application
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusColumns.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className={`${column.lightColor} rounded-xl p-3 mb-3`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <span className="font-semibold text-slate-700">{column.title}</span>
                <span className="ml-auto text-sm text-slate-500 bg-white/50 px-2 py-0.5 rounded-full">
                  {getColumnApps(column.id).length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[400px]">
              {getColumnApps(column.id).map(app => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => handleDragStart(app)}
                  className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                    draggedApp?.id === app.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <GripVertical className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 truncate">{app.position}</h4>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate">{app.company_name}</span>
                      </div>
                    </div>
                  </div>

                  {app.deadline && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Deadline: {new Date(app.deadline).toLocaleDateString()}</span>
                    </div>
                  )}

                  <button
                    onClick={() => app.ai_prep_schedule ? (setSelectedApp(app), setShowPrepModal(true)) : generateAIPrep(app)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-600 rounded-lg text-sm font-medium hover:from-purple-100 hover:to-indigo-100 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {app.ai_prep_schedule ? 'View AI Prep' : 'Generate AI Prep'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add Application</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={newApp.company_name}
                    onChange={(e) => setNewApp({ ...newApp, company_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Google"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={newApp.position}
                    onChange={(e) => setNewApp({ ...newApp, position: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Software Engineer Intern"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
                <textarea
                  value={newApp.job_description}
                  onChange={(e) => setNewApp({ ...newApp, job_description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Paste the job description for AI prep..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={newApp.deadline}
                    onChange={(e) => setNewApp({ ...newApp, deadline: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
              >
                Add Application
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Prep Schedule Modal */}
      {showPrepModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">7-Day AI Prep Schedule</h3>
                  <p className="text-slate-500">{selectedApp.position} at {selectedApp.company_name}</p>
                </div>
                <button onClick={() => setShowPrepModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isGeneratingPrep ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">Generating your personalized prep schedule...</p>
                  <p className="text-slate-400 text-sm">This may take a moment</p>
                </div>
              ) : selectedApp.ai_prep_schedule ? (
                <div className="space-y-6">
                  {/* Key Skills */}
                  {selectedApp.ai_prep_schedule.keySkills && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Key Skills to Focus
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.ai_prep_schedule.keySkills.map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-purple-700 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule Days */}
                  <div className="grid gap-4">
                    {selectedApp.ai_prep_schedule.schedule?.map((day: PrepDay) => (
                      <div key={day.day} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                            D{day.day}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-slate-800">{day.title}</h5>
                              <span className="flex items-center gap-1 text-sm text-slate-500">
                                <Clock className="w-4 h-4" />
                                {day.timeEstimate}
                              </span>
                            </div>
                            <p className="text-sm text-purple-600 mb-3">{day.focus}</p>
                            
                            <div className="space-y-2">
                              {day.tasks.map((task, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                  <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <span>{task}</span>
                                </div>
                              ))}
                            </div>

                            {day.resources && day.resources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  Resources
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {day.resources.map((resource, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-white rounded text-xs text-slate-600">
                                      {resource}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interview Tips */}
                  {selectedApp.ai_prep_schedule.interviewTips && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                      <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Interview Tips
                      </h4>
                      <ul className="space-y-2">
                        {selectedApp.ai_prep_schedule.interviewTips.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">No prep schedule generated yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
