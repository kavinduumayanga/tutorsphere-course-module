import coursesData from '../data/courses.json';
import { Course, Enrollment } from '../types';

const COURSES_KEY = 'tutorsphere_courses';
const ENROLLMENTS_KEY = 'tutorsphere_enrollments';

function getCourses(): Course[] {
  const stored = localStorage.getItem(COURSES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* fall through */ }
  }
  localStorage.setItem(COURSES_KEY, JSON.stringify(coursesData));
  return coursesData as Course[];
}

function saveCourses(courses: Course[]): void {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

function getEnrollments(userId: string): Enrollment[] {
  const key = `${ENROLLMENTS_KEY}_${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* fall through */ }
  }
  return [];
}

function saveEnrollments(userId: string, enrollments: Enrollment[]): void {
  localStorage.setItem(`${ENROLLMENTS_KEY}_${userId}`, JSON.stringify(enrollments));
}

export const courseService = {
  getAllCourses(): Course[] {
    return getCourses();
  },

  getCourseById(id: string): Course | null {
    return getCourses().find(c => c.id === id) || null;
  },

  getCoursesByTutor(tutorId: string): Course[] {
    return getCourses().filter(c => c.tutorId === tutorId);
  },

  searchCourses(query: string): Course[] {
    const q = query.toLowerCase();
    return getCourses().filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q)
    );
  },

  createCourse(course: Course): Course {
    const courses = getCourses();
    courses.push(course);
    saveCourses(courses);
    return course;
  },

  updateCourse(updated: Course): Course {
    const courses = getCourses();
    const idx = courses.findIndex(c => c.id === updated.id);
    if (idx !== -1) {
      courses[idx] = updated;
      saveCourses(courses);
    }
    return updated;
  },

  deleteCourse(courseId: string): void {
    const courses = getCourses().filter(c => c.id !== courseId);
    saveCourses(courses);
  },

  enrollStudent(courseId: string, userId: string): boolean {
    const courses = getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return false;

    // Add to course's enrolledStudents if not already there
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      saveCourses(courses);
    }

    // Always ensure an enrollment record exists
    const enrollments = getEnrollments(userId);
    if (!enrollments.some(e => e.courseId === courseId)) {
      enrollments.push({
        courseId,
        enrolledAt: new Date().toISOString().split('T')[0],
        completedModules: [],
      });
      saveEnrollments(userId, enrollments);
    }
    return true;
  },

  getEnrollments(userId: string): Enrollment[] {
    return getEnrollments(userId);
  },

  isEnrolled(courseId: string, userId: string): boolean {
    // Check enrollment records first
    const enrollments = getEnrollments(userId);
    if (enrollments.some(e => e.courseId === courseId)) return true;
    // Also check course's enrolledStudents (seed data)
    const course = this.getCourseById(courseId);
    if (course && course.enrolledStudents.includes(userId)) {
      // Auto-create missing enrollment record
      this.enrollStudent(courseId, userId);
      return true;
    }
    return false;
  },

  completeModule(courseId: string, moduleId: string, userId: string): void {
    // Ensure enrollment record exists
    this.enrollStudent(courseId, userId);

    const enrollments = getEnrollments(userId);
    const enrollment = enrollments.find(e => e.courseId === courseId);
    if (enrollment && !enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
      saveEnrollments(userId, enrollments);
    }
  },

  getProgress(courseId: string, userId: string): { completed: number; total: number } {
    const course = this.getCourseById(courseId);
    if (!course) return { completed: 0, total: 0 };

    // Ensure enrollment record exists if user is enrolled
    if (this.isEnrolled(courseId, userId)) {
      const enrollments = getEnrollments(userId);
      const enrollment = enrollments.find(e => e.courseId === courseId);
      return {
        completed: enrollment ? enrollment.completedModules.length : 0,
        total: course.modules.length,
      };
    }
    return { completed: 0, total: course.modules.length };
  },

  isCourseComplete(courseId: string, userId: string): boolean {
    const progress = this.getProgress(courseId, userId);
    return progress.total > 0 && progress.completed === progress.total;
  },
};
