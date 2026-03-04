import React, { useState, useEffect, useRef } from 'react';
import { Search, FolderOpen, Plus, X, Save, Upload, FileText } from 'lucide-react';
import { Resource } from '../types';
import { resourceService } from '../services/resourceService';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import { storeFile, removeStoredFile } from '../services/fileStore';

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Upload form state
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<Resource['type']>('Note');
  const [resSubject, setResSubject] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = () => {
    setResources(resourceService.getAllResources());
  };

  const filtered = searchQuery
    ? resourceService.searchResources(searchQuery)
    : resources;

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newId = `r_${Date.now()}`;

    // Store the uploaded file in localStorage if provided
    if (uploadFile) {
      await storeFile(newId, uploadFile);
    }

    resourceService.addResource({
      id: newId,
      title: resTitle,
      type: resType,
      subject: resSubject,
      description: resDescription,
      url: '#',
      uploadedBy: user.id,
      createdAt: new Date().toISOString().split('T')[0],
    });

    setResTitle('');
    setResType('Note');
    setResSubject('');
    setResDescription('');
    setUploadFile(null);
    setIsFormOpen(false);
    loadResources();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this resource?')) {
      resourceService.deleteResource(id);
      removeStoredFile(id);
      loadResources();
    }
  };

  const handleFileSelect = (file: File) => {
    setUploadFile(file);
    // Auto-fill title from filename if title is blank
    if (!resTitle) {
      setResTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
    // Auto-detect type from file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') setResType('PDF');
    else if (ext === 'doc' || ext === 'docx') setResType('Paper');
    else if (ext === 'txt' || ext === 'md') setResType('Note');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <FolderOpen className="w-3.5 h-3.5" /> Resource Library
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Free Resources</h1>
          <p className="text-slate-500 mt-1">
            Browse and download free papers, notes, and articles.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
            />
          </div>
          {user?.role === 'tutor' && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all whitespace-nowrap flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Upload
            </button>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsFormOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Upload Resource</h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4">
              {/* File Upload Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-50'
                    : uploadFile
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx,.xls,.xlsx,.zip"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-emerald-100 p-2.5 rounded-xl">
                      <FileText className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[220px]">
                        {uploadFile.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(uploadFile.size / 1024).toFixed(1)} KB &bull; Click to change
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setUploadFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-2 p-1.5 bg-rose-100 text-rose-500 rounded-lg hover:bg-rose-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">
                      Drag & drop your file here or <span className="text-indigo-600 font-bold">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PDF, DOC, TXT, PPT, XLS, ZIP — Max 5 MB
                    </p>
                  </>
                )}
              </div>

              <input
                required
                value={resTitle}
                onChange={e => setResTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                placeholder="Resource title"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={resType}
                  onChange={e => setResType(e.target.value as Resource['type'])}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Paper">Paper</option>
                  <option value="Note">Note</option>
                  <option value="Article">Article</option>
                  <option value="PDF">PDF</option>
                </select>
                <input
                  required
                  value={resSubject}
                  onChange={e => setResSubject(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm"
                  placeholder="Subject"
                />
              </div>
              <textarea
                value={resDescription}
                onChange={e => setResDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium resize-none"
                placeholder="Brief description..."
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Upload Resource
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Resource List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No resources found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              canDelete={user?.role === 'tutor' && resource.uploadedBy === user.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
