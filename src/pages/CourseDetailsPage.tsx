import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Circle,
  BookOpen,
  Users,
  Award,
  Lock,
} from 'lucide-react';
import { Course } from '../types';
import { courseService } from '../services/courseService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import CertificateModal from '../components/CertificateModal';
import { downloadModuleResource } from '../services/moduleResourceDownload';

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [progressVersion, setProgressVersion] = useState(0);

  // Helper function to convert Unsplash page URLs to direct image URLs
  const getImageUrl = (url: string): string => {
    if (url.startsWith('https://unsplash.com/photos/')) {
      // Extract photo ID from URL (the part after the last hyphen in the slug)
      const slug = url.split('/').pop() || '';
      const lastHyphenIndex = slug.lastIndexOf('-');
      const photoId = lastHyphenIndex !== -1 ? slug.substring(lastHyphenIndex + 1) : slug;
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=400&h=250`;
    }
    return url;
  };

  useEffect(() => {
    if (id) {
      const c = courseService.getCourseById(id);
      setCourse(c);
      if (user && c) {
        setIsEnrolled(courseService.isEnrolled(id, user.id));
        const enrollments = courseService.getEnrollments(user.id);
        const enrollment = enrollments.find(e => e.courseId === id);
        if (enrollment) {
          setCompletedModules(enrollment.completedModules);
        }
      }
    }
  }, [id, user]);

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400 text-lg">Course not found.</p>
        <button
          onClick={() => navigate('/courses')}
          className="text-indigo-600 font-bold mt-4 hover:underline"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const tutor = authService.getUserById(course.tutorId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _pv = progressVersion; // referenced so React re-computes on change
  const progress = user
    ? courseService.getProgress(course.id, user.id)
    : { completed: 0, total: course.modules.length };
  const progressPercent =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const isComplete = progress.total > 0 && progress.completed === progress.total;
  const activeModule = course.modules[activeModuleIdx];

  const handleEnroll = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    courseService.enrollStudent(course.id, user.id);
    setIsEnrolled(true);
  };

  const handleCompleteModule = (moduleId: string) => {
    if (!user || !isEnrolled) return;
    courseService.completeModule(course.id, moduleId, user.id);
    setCompletedModules(prev =>
      prev.includes(moduleId) ? prev : [...prev, moduleId]
    );
    setProgressVersion(v => v + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Courses
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          {isEnrolled && activeModule ? (
            <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video">
              <iframe
                src={activeModule.videoUrl}
                title={activeModule.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
              <img
                src={getImageUrl(course.thumbnail)}
                alt={course.title}
                className="w-full h-full object-cover opacity-30 absolute inset-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400&h=250';
                }}
              />
              <div className="relative text-center text-white z-10 p-6">
                {!isEnrolled ? (
                  <>
                    <Lock className="w-12 h-12 mx-auto mb-4 opacity-60" />
                    <p className="font-bold text-lg">Enroll to start watching</p>
                    <p className="text-sm text-slate-300 mt-1">
                      Get full access to all {course.modules.length} modules
                    </p>
                  </>
                ) : (
                  <>
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-60" />
                    <p className="font-bold text-lg">Select a module to begin</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Active Module Info */}
          {isEnrolled && activeModule && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{activeModule.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Module {activeModuleIdx + 1} of {course.modules.length} &bull;{' '}
                    {activeModule.duration}
                  </p>
                </div>
                {!completedModules.includes(activeModule.id) ? (
                  <button
                    onClick={() => handleCompleteModule(activeModule.id)}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
                  >
                    Mark Complete
                  </button>
                ) : (
                  <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl">
                    <CheckCircle className="w-5 h-5" /> Completed
                  </span>
                )}
              </div>
              {activeModule.resources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Module Resources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeModule.resources.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => downloadModuleResource(r)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
                        title={`Download ${r}`}
                      >
                        📄 {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Course Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{course.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> {course.modules.length} Modules
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {course.enrolledStudents.length} Students
              </span>
              {tutor && (
                <span className="flex items-center gap-1.5">
                  By <strong className="text-slate-700">{tutor.name}</strong>
                </span>
              )}
            </div>
            <p className="text-slate-600 leading-relaxed">{course.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment / Progress Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            {isEnrolled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Your Progress</h3>
                  <span className="text-indigo-600 font-bold text-lg">{progressPercent}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {progress.completed} of {progress.total} modules completed
                </p>

                {isComplete && (
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
                  >
                    <Award className="w-5 h-5" /> Download Certificate
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <h3 className="font-bold text-slate-900 text-lg">Ready to learn?</h3>
                <p className="text-sm text-slate-500">
                  Enroll now to access all modules and track your progress.
                </p>
                <button
                  onClick={handleEnroll}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Enroll Now — Free
                </button>
              </div>
            )}
          </div>

          {/* Module List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Course Modules</h3>
            <div className="space-y-2">
              {course.modules.map((mod, idx) => {
                const isCompleted = completedModules.includes(mod.id);
                const isActive = idx === activeModuleIdx && isEnrolled;
                return (
                  <button
                    key={mod.id}
                    onClick={() => isEnrolled && setActiveModuleIdx(idx)}
                    disabled={!isEnrolled}
                    className={`w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                        : isEnrolled
                          ? 'hover:bg-slate-50 border border-transparent text-slate-600'
                          : 'opacity-60 border border-transparent text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : isActive ? (
                      <Play className="w-5 h-5 text-indigo-600 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? 'text-indigo-700' : ''
                        }`}
                      >
                        {mod.title}
                      </p>
                      <p className="text-xs text-slate-400">{mod.duration}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        studentName={user?.name || ''}
        courseTitle={course.title}
        tutorName={tutor?.name || 'TutorSphere Instructor'}
        completionDate={new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      />
    </div>
  );
}
