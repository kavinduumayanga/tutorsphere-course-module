import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, BookOpen, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Course, CourseModule } from '../types';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

export default function TutorCourseManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [modules, setModules] = useState<CourseModule[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'tutor') {
      navigate('/login');
      return;
    }
    loadCourses();
  }, [user, navigate]);

  const loadCourses = () => {
    if (user) {
      setCourses(courseService.getCoursesByTutor(user.id));
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setThumbnail('');
    setModules([]);
    setEditingCourse(null);
    setIsFormOpen(false);
  };

  const openEditForm = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setSubject(course.subject);
    setThumbnail(course.thumbnail);
    setModules([...course.modules]);
    setIsFormOpen(true);
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: `m${Date.now()}`,
        title: '',
        videoUrl: '',
        duration: '',
        resources: [],
      },
    ]);
  };

  const updateModule = (idx: number, field: keyof CourseModule, value: string | string[]) => {
    const updated = [...modules];
    (updated[idx] as any)[field] = value;
    setModules(updated);
  };

  const removeModule = (idx: number) => {
    setModules(modules.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const courseData: Course = {
      id: editingCourse?.id || `course_${Date.now()}`,
      title,
      tutorId: user.id,
      description,
      thumbnail:
        thumbnail ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400&h=250',
      modules,
      enrolledStudents: editingCourse?.enrolledStudents || [],
      subject,
      price: 0,
      createdAt: editingCourse?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingCourse) {
      courseService.updateCourse(courseData);
    } else {
      courseService.createCourse(courseData);
    }

    resetForm();
    loadCourses();
  };

  const handleDelete = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      courseService.deleteCourse(courseId);
      loadCourses();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Courses</h1>
          <p className="text-slate-500 mt-1">Create, edit, and organize your courses.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Course
        </button>
      </div>

      {/* Course Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
          <div onClick={resetForm} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 mb-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Course Title
                  </label>
                  <input
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    placeholder="e.g. Java Programming Basics"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    placeholder="e.g. Programming"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium resize-none"
                  placeholder="Describe what students will learn..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Thumbnail URL (optional)
                </label>
                <input
                  value={thumbnail}
                  onChange={e => setThumbnail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Modules Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Modules
                  </label>
                  <button
                    type="button"
                    onClick={addModule}
                    className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:text-indigo-700"
                  >
                    <Plus className="w-4 h-4" /> Add Module
                  </button>
                </div>

                {modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Module {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeModule(idx)}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      required
                      value={mod.title}
                      onChange={e => updateModule(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="Module title"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        value={mod.videoUrl}
                        onChange={e => updateModule(idx, 'videoUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Video URL (YouTube embed)"
                      />
                      <input
                        value={mod.duration}
                        onChange={e => updateModule(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Duration (e.g. 15 min)"
                      />
                    </div>
                  </div>
                ))}

                {modules.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No modules yet. Click "Add Module" to get started.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> {editingCourse ? 'Update Course' : 'Create Course'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-4">
            You haven't created any courses yet.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="text-indigo-600 font-bold hover:underline"
          >
            Create your first course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            >
              {/* Course Row */}
              <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() =>
                  setExpandedCourse(expandedCourse === course.id ? null : course.id)
                }
              >
                <div className="flex items-center gap-4">
                  <img
                    src={course.thumbnail}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{course.title}</h3>
                    <p className="text-sm text-slate-400">
                      {course.modules.length} modules &bull; {course.enrolledStudents.length}{' '}
                      students &bull; {course.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openEditForm(course);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Edit course"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(course.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete course"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {expandedCourse === course.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCourse === course.id && (
                <div className="px-6 pb-6 border-t border-slate-50">
                  <p className="text-sm text-slate-500 my-4">{course.description}</p>
                  <div className="space-y-2">
                    {course.modules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm"
                      >
                        <span className="bg-indigo-100 text-indigo-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-700 flex-1">{mod.title}</span>
                        <span className="text-slate-400 text-xs">{mod.duration}</span>
                      </div>
                    ))}
                    {course.modules.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-3">
                        No modules added to this course yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
