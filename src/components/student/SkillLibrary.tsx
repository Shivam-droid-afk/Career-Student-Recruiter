import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, BookOpen, Clock, Award, CheckCircle, Play, GraduationCap } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  skill_tags: string[];
  credits: number;
  duration_hours: number;
  university_aligned: boolean;
  image_url: string;
  progress?: number;
  completed?: boolean;
}

const categories = ['All', 'Programming', 'Frontend', 'Backend', 'AI/ML', 'Cloud', 'DevOps', 'Design', 'Soft Skills', 'Computer Science'];

const SkillLibrary: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUniversityOnly, setShowUniversityOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    setIsLoading(true);
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .order('title');

    if (coursesData && user) {
      const { data: progressData } = await supabase
        .from('student_courses')
        .select('*')
        .eq('student_id', user.id);

      const coursesWithProgress = coursesData.map(course => {
        const progress = progressData?.find(p => p.course_id === course.id);
        return {
          ...course,
          progress: progress?.progress || 0,
          completed: progress?.completed || false
        };
      });

      setCourses(coursesWithProgress);
    } else if (coursesData) {
      setCourses(coursesData);
    }
    setIsLoading(false);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.skill_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesUniversity = !showUniversityOnly || course.university_aligned;
    return matchesSearch && matchesCategory && matchesUniversity;
  });

  const handleStartCourse = async (course: Course) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('student_courses')
      .select('*')
      .eq('student_id', user.id)
      .eq('course_id', course.id)
      .single();

    if (!existing) {
      await supabase
        .from('student_courses')
        .insert({
          student_id: user.id,
          course_id: course.id,
          progress: 10
        });
    }

    // Update local state
    setCourses(courses.map(c =>
      c.id === course.id ? { ...c, progress: Math.max(c.progress || 0, 10) } : c
    ));
  };

  const handleCompleteCourse = async (course: Course) => {
    if (!user) return;

    await supabase
      .from('student_courses')
      .upsert({
        student_id: user.id,
        course_id: course.id,
        progress: 100,
        completed: true,
        completed_at: new Date().toISOString()
      });

    // Update credits
    const newCredits = (user.total_credits || 0) + course.credits;
    await updateUser({ total_credits: newCredits });

    // Update local state
    setCourses(courses.map(c =>
      c.id === course.id ? { ...c, progress: 100, completed: true } : c
    ));
  };

  const completedCount = courses.filter(c => c.completed).length;
  const totalCredits = courses.filter(c => c.completed).reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Skill Library</h2>
        <p className="text-slate-500">Build your skills with university-aligned courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-purple-100 text-sm">Courses Completed</p>
              <p className="text-2xl font-bold">{completedCount}/{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Credits Earned</p>
              <p className="text-2xl font-bold">{totalCredits}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-amber-100 text-sm">University Aligned</p>
              <p className="text-2xl font-bold">{courses.filter(c => c.university_aligned).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => setShowUniversityOnly(!showUniversityOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                showUniversityOnly
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              University Only
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-40 bg-slate-200 rounded-lg mb-4" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course.university_aligned && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                    <GraduationCap className="w-3 h-3" />
                    University
                  </div>
                )}
                {course.completed && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {course.credits} credits
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                    {course.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {course.duration_hours}h
                  </span>
                </div>

                <h3 className="font-semibold text-slate-800 mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{course.description}</p>

                {/* Skill Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.skill_tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Progress Bar */}
                {(course.progress || 0) > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {course.completed ? (
                  <button className="w-full py-2.5 bg-green-50 text-green-600 rounded-xl font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </button>
                ) : (course.progress || 0) > 0 ? (
                  <button
                    onClick={() => handleCompleteCourse(course)}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartCourse(course)}
                    className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Course
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCourses.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No courses found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default SkillLibrary;
