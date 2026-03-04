import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight } from 'lucide-react';
import { Course } from '../types';
import { authService } from '../services/authService';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const tutor = authService.getUserById(course.tutorId);

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

  return (
    <Link
      to={`/courses/${course.id}`}
      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={getImageUrl(course.thumbnail)}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400&h=250';
          }}
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 uppercase tracking-wider border border-white/50 shadow-sm">
            {course.subject}
          </span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
            {course.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{course.description}</p>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {course.modules.length} modules
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {course.enrolledStudents.length} enrolled
            </span>
          </div>
          <div className="text-indigo-600 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
        {tutor && (
          <p className="text-xs text-slate-400 mt-3 font-medium">By {tutor.name}</p>
        )}
      </div>
    </Link>
  );
}
