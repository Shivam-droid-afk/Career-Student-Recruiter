import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Upload, Award, Calendar, Building2, CheckCircle, Maximize2, Trash2 } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date?: string;
  image_url: string;
  verified: boolean;
}

const CertificateVault: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    issue_date: ''
  });
  const [certImage, setCertImage] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setCertificates(data);
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !certImage) return;
    setIsUploading(true);

    try {
      const fileName = `${user.id}/certificates/${Date.now()}-${certImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bridgeup-media')
        .upload(fileName, certImage);

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('bridgeup-media')
          .getPublicUrl(fileName);

        const { data: certData, error } = await supabase
          .from('certificates')
          .insert({
            student_id: user.id,
            title: newCert.title,
            issuer: newCert.issuer,
            issue_date: newCert.issue_date || null,
            image_url: publicUrl,
            verified: false
          })
          .select()
          .single();

        if (certData) {
          setCertificates([certData, ...certificates]);
          setShowAddModal(false);
          setNewCert({ title: '', issuer: '', issue_date: '' });
          setCertImage(null);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCertificate = async (certId: string) => {
    await supabase.from('certificates').delete().eq('id', certId);
    setCertificates(certificates.filter(c => c.id !== certId));
    setSelectedCert(null);
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Certificate Vault</h2>
          <p className="text-slate-500">Store and showcase your achievements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Certificate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Certificates</p>
              <p className="text-xl font-bold text-slate-800">{certificates.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Verified</p>
              <p className="text-xl font-bold text-slate-800">{certificates.filter(c => c.verified).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Unique Issuers</p>
              <p className="text-xl font-bold text-slate-800">{new Set(certificates.map(c => c.issuer)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {certificates.map(cert => (
          <div
            key={cert.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group cursor-pointer"
            onClick={() => setSelectedCert(cert)}
          >
            <div className="relative h-40 bg-slate-100">
              <img
                src={cert.image_url}
                alt={cert.title}
                className="w-full h-full object-cover"
              />
              {cert.verified && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Maximize2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 truncate">{cert.title}</h3>
              <p className="text-sm text-slate-500 truncate">{cert.issuer}</p>
              {cert.issue_date && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(cert.issue_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">No certificates yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            Add Your First Certificate
          </button>
        </div>
      )}

      {/* Add Certificate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add Certificate</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddCertificate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Certificate Title</label>
                <input
                  type="text"
                  value={newCert.title}
                  onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., AWS Solutions Architect"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issuer</label>
                <input
                  type="text"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Amazon Web Services"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={newCert.issue_date}
                  onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Certificate Image</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCertImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="cert-upload"
                    required
                  />
                  <label
                    htmlFor="cert-upload"
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    {certImage ? (
                      <div className="text-center">
                        <img
                          src={URL.createObjectURL(certImage)}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto mb-2"
                        />
                        <p className="text-sm text-slate-600">{certImage.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Click to upload certificate image</p>
                        <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading || !certImage}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Add Certificate'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Preview */}
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
              <button
                onClick={() => handleDeleteCertificate(selectedCert.id)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg mx-auto hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateVault;
