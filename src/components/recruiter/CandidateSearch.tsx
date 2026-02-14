import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Award, GraduationCap, Github, Linkedin, Code, ExternalLink, SortAsc, SortDesc, ChevronRight } from 'lucide-react';

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
  skills?: string[];
}

interface CandidateSearchProps {
  onSelectCandidate: (candidate: Candidate) => void;
}

const CandidateSearch: React.FC<CandidateSearchProps> = ({ onSelectCandidate }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const allSkills = ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Data Science', 'Java', 'C++', 'SQL', 'AWS', 'Docker', 'TypeScript'];

  useEffect(() => {
    fetchCandidates();
  }, [sortOrder]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('total_credits', { ascending: sortOrder === 'asc' });

    if (data) {
      // Fetch skills for each candidate from their courses
      const candidatesWithSkills = await Promise.all(
        data.map(async (candidate) => {
          const { data: courses } = await supabase
            .from('student_courses')
            .select('course:courses(skill_tags)')
            .eq('student_id', candidate.id)
            .eq('completed', true);

          const skills = courses?.flatMap(c => (c.course as any)?.skill_tags || []) || [];
          return { ...candidate, skills: [...new Set(skills)] };
        })
      );
      setCandidates(candidatesWithSkills);
    }
    setIsLoading(false);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.some(skill => candidate.skills?.includes(skill));

    return matchesSearch && matchesSkills;
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const getCreditLevel = (credits: number) => {
    if (credits >= 200) return { label: 'Expert', color: 'bg-purple-500' };
    if (credits >= 100) return { label: 'Advanced', color: 'bg-blue-500' };
    if (credits >= 50) return { label: 'Intermediate', color: 'bg-green-500' };
    return { label: 'Beginner', color: 'bg-slate-400' };
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Candidate Search</h2>
        <p className="text-slate-500">Find top talent ranked by credits and skills</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, university, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            <span>Credits: {sortOrder === 'desc' ? 'High to Low' : 'Low to High'}</span>
          </button>
        </div>

        {/* Skill Filters */}
        <div className="mt-4">
          <p className="text-sm text-slate-500 mb-2">Filter by skills:</p>
          <div className="flex flex-wrap gap-2">
            {allSkills.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Showing {filteredCandidates.length} candidates
        </p>
      </div>

      {/* Candidates List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate, index) => {
            const creditLevel = getCreditLevel(candidate.total_credits);
            return (
              <div
                key={candidate.id}
                onClick={() => onSelectCandidate(candidate)}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-cyan-200 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Avatar */}
                  <img
                    src={candidate.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.full_name)}&background=06b6d4&color=fff`}
                    alt={candidate.full_name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors">
                          {candidate.full_name}
                        </h3>
                        {candidate.university && (
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {candidate.university}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${creditLevel.color}`}>
                          {creditLevel.label}
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                          <Award className="w-3.5 h-3.5" />
                          <span className="text-sm font-bold">{candidate.total_credits}</span>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {candidate.skills.slice(0, 6).map(skill => (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              selectedSkills.includes(skill)
                                ? 'bg-cyan-100 text-cyan-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 6 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">
                            +{candidate.skills.length - 6}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center gap-2">
                      {candidate.github_url && (
                        <a
                          href={candidate.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Github className="w-4 h-4 text-slate-600" />
                        </a>
                      )}
                      {candidate.linkedin_url && (
                        <a
                          href={candidate.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600" />
                        </a>
                      )}
                      {candidate.leetcode_url && (
                        <a
                          href={candidate.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                          <Code className="w-4 h-4 text-amber-600" />
                        </a>
                      )}
                      {candidate.gfg_url && (
                        <a
                          href={candidate.gfg_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-green-600" />
                        </a>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-cyan-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredCandidates.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No candidates found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;
