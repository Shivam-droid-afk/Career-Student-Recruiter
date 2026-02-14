import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Github, Linkedin, Code, ExternalLink, Award, GraduationCap, BookOpen, Image, FileText, CheckCircle, X, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

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

interface Project {
  id: string;
  title: string;
  description?: string;
  contribution_summary?: string;
  project_type: 'paid' | 'unpaid' | 'collaborative';
  tech_stack: string[];
  github_link?: string;
  live_link?: string;
  images?: { id: string; image_url: string }[];
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date?: string;
  image_url: string;
  verified: boolean;
}

interface CandidateProfileProps {
  candidate: Candidate;
  onBack: () => void;
}

const projectTypeStyles = {
  paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
  unpaid: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Unpaid' },
  collaborative: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Collaborative' }
};

const CandidateProfile: React.FC<CandidateProfileProps> = ({ candidate, onBack }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [completedCourses, setCompletedCourses] = useState<number>(0);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [lightboxData, setLightboxData] = useState<{ images: { image_url: string }[]; index: number } | null>(null);

  useEffect(() => {
    fetchCandidateData();
  }, [candidate.id]);

  const fetchCandidateData = async () => {
    // Fetch projects with images
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', candidate.id)
      .order('created_at', { ascending: false });

    if (projectsData) {
      const projectsWithImages = await Promise.all(
        projectsData.map(async (project) => {
          const { data: images } = await supabase
            .from('project_images')
            .select('*')
            .eq('project_id', project.id);
          return { ...project, images: images || [] };
        })
      );
      setProjects(projectsWithImages);
    }

    // Fetch certificates
    const { data: certsData } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', candidate.id)
      .order('created_at', { ascending: false });

    if (certsData) {
      setCertificates(certsData);
    }

    // Fetch completed courses count
    const { count } = await supabase
      .from('student_courses')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', candidate.id)
      .eq('completed', true);

    setCompletedCourses(count || 0);
  };

  const getCreditLevel = (credits: number) => {
    if (credits >= 200) return { label: 'Expert', color: 'bg-purple-500' };
    if (credits >= 100) return { label: 'Advanced', color: 'bg-blue-500' };
    if (credits >= 50) return { label: 'Intermediate', color: 'bg-green-500' };
    return { label: 'Beginner', color: 'bg-slate-400' };
  };

  const creditLevel = getCreditLevel(candidate.total_credits);

  return (
    <div className="h-full">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Search
      </button>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card - Spans 1 column */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="text-center mb-6">
            <img
              src={candidate.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.full_name)}&background=06b6d4&color=fff&size=200`}
              alt={candidate.full_name}
              className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4"
            />
            <h2 className="text-xl font-bold text-slate-800">{candidate.full_name}</h2>
            {candidate.university && (
              <p className="text-slate-500 flex items-center justify-center gap-1 mt-1">
                <GraduationCap className="w-4 h-4" />
                {candidate.university}
              </p>
            )}
          </div>

          {/* Credit Badge */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`px-4 py-2 rounded-xl text-white font-medium ${creditLevel.color}`}>
              {creditLevel.label}
            </div>
            <div className="flex items-center gap-1 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl">
              <Award className="w-5 h-5" />
              <span className="font-bold text-lg">{candidate.total_credits}</span>
            </div>
          </div>

          {/* Bio */}
          {candidate.bio && (
            <p className="text-slate-600 text-sm mb-6">{candidate.bio}</p>
          )}

          {/* Social Links */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500 mb-3">Connect</p>
            <div className="grid grid-cols-2 gap-2">
              {candidate.github_url && (
                <a
                  href={candidate.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </a>
              )}
              {candidate.linkedin_url && (
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              )}
              {candidate.leetcode_url && (
                <a
                  href={candidate.leetcode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                >
                  <Code className="w-5 h-5" />
                  LeetCode
                </a>
              )}
              {candidate.gfg_url && (
                <a
                  href={candidate.gfg_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  GFG
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <Briefcase className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-sm text-white/80">Projects</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <Award className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">{certificates.length}</p>
              <p className="text-sm text-white/80">Certificates</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <BookOpen className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">{completedCourses}</p>
              <p className="text-sm text-white/80">Courses</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <Award className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">{candidate.total_credits}</p>
              <p className="text-sm text-white/80">Credits</p>
            </div>
          </div>
        </div>

        {/* Certificate Vault - Spans 1 column */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-800">Certificate Vault</h3>
          </div>
          
          {certificates.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {certificates.slice(0, 4).map(cert => (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className="relative rounded-xl overflow-hidden cursor-pointer group"
                >
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <p className="text-white text-xs font-medium truncate">{cert.title}</p>
                  </div>
                  {cert.verified && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No certificates yet</p>
            </div>
          )}
          {certificates.length > 4 && (
            <p className="text-sm text-slate-500 text-center mt-3">+{certificates.length - 4} more</p>
          )}
        </div>

        {/* Projects Section - Spans full width */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Image className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-800">Projects & Proof of Work</h3>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div key={project.id} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  {/* Project Images */}
                  {project.images && project.images.length > 0 ? (
                    <div
                      className="relative h-40 cursor-pointer"
                      onClick={() => setLightboxData({ images: project.images!, index: 0 })}
                    >
                      <img
                        src={project.images[0].image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      {project.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
                          <Image className="w-3 h-3" />
                          +{project.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-40 bg-slate-100 flex items-center justify-center">
                      <Image className="w-10 h-10 text-slate-300" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">{project.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${projectTypeStyles[project.project_type].bg} ${projectTypeStyles[project.project_type].text}`}>
                        {projectTypeStyles[project.project_type].label}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>
                    )}

                    {/* Contribution Summary */}
                    {project.contribution_summary && (
                      <div className="p-3 bg-purple-50 rounded-lg mb-3">
                        <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                          <FileText className="w-3 h-3" />
                          Contribution
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-3">{project.contribution_summary}</p>
                      </div>
                    )}

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tech_stack?.slice(0, 4).map(tech => (
                        <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-2">
                      {project.github_link && (
                        <a
                          href={project.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Github className="w-4 h-4 text-slate-600" />
                        </a>
                      )}
                      {project.live_link && (
                        <a
                          href={project.live_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-600" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No projects yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Full Screen Preview */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setSelectedCert(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl w-full">
            <img
              src={selectedCert.image_url}
              alt={selectedCert.title}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white">{selectedCert.title}</h3>
              <p className="text-white/70">{selectedCert.issuer}</p>
              {selectedCert.verified && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxData && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            onClick={() => setLightboxData(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setLightboxData({ ...lightboxData, index: lightboxData.index - 1 })}
            disabled={lightboxData.index === 0}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={lightboxData.images[lightboxData.index].image_url}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          <button
            onClick={() => setLightboxData({ ...lightboxData, index: lightboxData.index + 1 })}
            disabled={lightboxData.index === lightboxData.images.length - 1}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {lightboxData.index + 1} / {lightboxData.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfile;
