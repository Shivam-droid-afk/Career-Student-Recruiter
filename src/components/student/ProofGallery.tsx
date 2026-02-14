import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Image, Upload, Github, ExternalLink, Tag, FileText, ChevronLeft, ChevronRight, Trash2, Award } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description?: string;
  contribution_summary?: string;
  project_type: 'paid' | 'unpaid' | 'collaborative';
  tech_stack: string[];
  github_link?: string;
  live_link?: string;
  credits_earned: number;
  images?: ProjectImage[];
}

interface ProjectImage {
  id: string;
  image_url: string;
  caption?: string;
}

const projectTypeStyles = {
  paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
  unpaid: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Unpaid' },
  collaborative: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Collaborative' }
};

const ProofGallery: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    contribution_summary: '',
    project_type: 'unpaid' as Project['project_type'],
    tech_stack: '',
    github_link: '',
    live_link: ''
  });

  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', user.id)
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
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUploading(true);

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          student_id: user.id,
          title: newProject.title,
          description: newProject.description,
          contribution_summary: newProject.contribution_summary,
          project_type: newProject.project_type,
          tech_stack: newProject.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
          github_link: newProject.github_link || null,
          live_link: newProject.live_link || null,
          credits_earned: 25
        })
        .select()
        .single();

      if (project) {
        // Upload images
        const uploadedImages: ProjectImage[] = [];
        for (const file of newImages) {
          const fileName = `${user.id}/${project.id}/${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bridgeup-media')
            .upload(fileName, file);

          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('bridgeup-media')
              .getPublicUrl(fileName);

            const { data: imageData } = await supabase
              .from('project_images')
              .insert({
                project_id: project.id,
                image_url: publicUrl
              })
              .select()
              .single();

            if (imageData) {
              uploadedImages.push(imageData);
            }
          }
        }

        // Update credits
        const newCredits = (user.total_credits || 0) + 25;
        await updateUser({ total_credits: newCredits });

        setProjects([{ ...project, images: uploadedImages }, ...projects]);
        setShowAddModal(false);
        setNewProject({ title: '', description: '', contribution_summary: '', project_type: 'unpaid', tech_stack: '', github_link: '', live_link: '' });
        setNewImages([]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages([...newImages, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleDeleteProject = async (projectId: string) => {
    await supabase.from('project_images').delete().eq('project_id', projectId);
    await supabase.from('projects').delete().eq('id', projectId);
    setProjects(projects.filter(p => p.id !== projectId));
    setShowDetailModal(false);
    setSelectedProject(null);
  };

  const openLightbox = (project: Project, imageIndex: number) => {
    setSelectedProject(project);
    setLightboxIndex(imageIndex);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const navigateLightbox = (direction: number) => {
    if (selectedProject && lightboxIndex !== null) {
      const newIndex = lightboxIndex + direction;
      if (newIndex >= 0 && newIndex < (selectedProject.images?.length || 0)) {
        setLightboxIndex(newIndex);
      }
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Proof of Work Gallery</h2>
          <p className="text-slate-500">Showcase your projects and achievements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">Total Projects</p>
          <p className="text-2xl font-bold text-slate-800">{projects.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm text-green-600">Paid</p>
          <p className="text-2xl font-bold text-green-700">{projects.filter(p => p.project_type === 'paid').length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-600">Unpaid</p>
          <p className="text-2xl font-bold text-blue-700">{projects.filter(p => p.project_type === 'unpaid').length}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-sm text-purple-600">Collaborative</p>
          <p className="text-2xl font-bold text-purple-700">{projects.filter(p => p.project_type === 'collaborative').length}</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div
            key={project.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group"
          >
            {/* Image Gallery Preview */}
            <div className="relative h-48 bg-slate-100">
              {project.images && project.images.length > 0 ? (
                <div className="relative h-full">
                  <img
                    src={project.images[0].image_url}
                    alt={project.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openLightbox(project, 0)}
                  />
                  {project.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      +{project.images.length - 1}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-12 h-12 text-slate-300" />
                </div>
              )}
              
              {/* Project Type Badge */}
              <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${projectTypeStyles[project.project_type].bg} ${projectTypeStyles[project.project_type].text}`}>
                {projectTypeStyles[project.project_type].label}
              </div>

              {/* Credits Badge */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Award className="w-3 h-3" />
                {project.credits_earned} credits
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-slate-800 mb-2">{project.title}</h3>
              
              {project.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>
              )}

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.tech_stack?.slice(0, 4).map(tech => (
                  <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    {tech}
                  </span>
                ))}
                {project.tech_stack?.length > 4 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    +{project.tech_stack.length - 4}
                  </span>
                )}
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
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowDetailModal(true);
                  }}
                  className="ml-auto px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">No projects yet. Start showcasing your work!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            Add Your First Project
          </button>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add New Project</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., E-commerce Platform"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Type</label>
                <div className="flex gap-2">
                  {(['paid', 'unpaid', 'collaborative'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, project_type: type })}
                      className={`flex-1 py-2 px-4 rounded-xl border transition-all ${
                        newProject.project_type === type
                          ? `${projectTypeStyles[type].bg} ${projectTypeStyles[type].text} border-transparent`
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {projectTypeStyles[type].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Brief project description..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Your Contribution Summary
                </label>
                <textarea
                  value={newProject.contribution_summary}
                  onChange={(e) => setNewProject({ ...newProject, contribution_summary: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Explain exactly what you contributed and why it matters..."
                  rows={4}
                />
                <p className="text-xs text-slate-400 mt-1">{newProject.contribution_summary.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.tech_stack}
                  onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="React, Node.js, PostgreSQL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Link</label>
                  <input
                    type="url"
                    value={newProject.github_link}
                    onChange={(e) => setNewProject({ ...newProject, github_link: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Live Link</label>
                  <input
                    type="url"
                    value={newProject.live_link}
                    onChange={(e) => setNewProject({ ...newProject, live_link: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Images</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">Click to upload images</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                  </label>
                  
                  {newImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Add Project'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800">{selectedProject.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${projectTypeStyles[selectedProject.project_type].bg} ${projectTypeStyles[selectedProject.project_type].text}`}>
                  {projectTypeStyles[selectedProject.project_type].label}
                </span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Image Gallery */}
            {selectedProject.images && selectedProject.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {selectedProject.images.map((image, index) => (
                  <img
                    key={image.id}
                    src={image.image_url}
                    alt={`${selectedProject.title} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openLightbox(selectedProject, index)}
                  />
                ))}
              </div>
            )}

            {selectedProject.description && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-500 mb-1">Description</h4>
                <p className="text-slate-700">{selectedProject.description}</p>
              </div>
            )}

            {selectedProject.contribution_summary && (
              <div className="mb-4 p-4 bg-purple-50 rounded-xl">
                <h4 className="text-sm font-medium text-purple-700 mb-1 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  My Contribution
                </h4>
                <p className="text-slate-700">{selectedProject.contribution_summary}</p>
              </div>
            )}

            {selectedProject.tech_stack && selectedProject.tech_stack.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-500 mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech_stack.map(tech => (
                    <span key={tech} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              {selectedProject.github_link && (
                <a
                  href={selectedProject.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {selectedProject.live_link && (
                <a
                  href={selectedProject.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && selectedProject && selectedProject.images && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => navigateLightbox(-1)}
            disabled={lightboxIndex === 0}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={selectedProject.images[lightboxIndex].image_url}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          <button
            onClick={() => navigateLightbox(1)}
            disabled={lightboxIndex === selectedProject.images.length - 1}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {selectedProject.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofGallery;
