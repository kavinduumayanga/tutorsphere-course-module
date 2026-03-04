export type UserRole = 'student' | 'tutor';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CourseModule {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  resources: string[];
}

export interface Course {
  id: string;
  title: string;
  tutorId: string;
  description: string;
  thumbnail: string;
  modules: CourseModule[];
  enrolledStudents: string[];
  subject: string;
  price: number;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Paper' | 'Note' | 'Article' | 'PDF';
  subject: string;
  description: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Enrollment {
  courseId: string;
  enrolledAt: string;
  completedModules: string[];
}
