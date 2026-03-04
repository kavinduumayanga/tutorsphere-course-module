import { X, Download, Award } from 'lucide-react';
import jsPDF from 'jspdf';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  courseTitle: string;
  tutorName: string;
  completionDate: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  studentName,
  courseTitle,
  tutorName,
  completionDate,
}: CertificateModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, w, h, 'F');

    // Outer border
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(3);
    doc.rect(10, 10, w - 20, h - 20);

    // Inner border
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, w - 30, h - 30);

    // Top accent bar
    doc.setFillColor(99, 102, 241);
    doc.rect(10, 10, w - 20, 2, 'F');

    // Platform name
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(99, 102, 241);
    doc.text('TUTORSPHERE', w / 2, 40, { align: 'center' });

    // Title
    doc.setFontSize(32);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Completion', w / 2, 60, { align: 'center' });

    // Decorative line
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.line(w / 2 - 40, 67, w / 2 + 40, 67);

    // "This is to certify that"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('This is to certify that', w / 2, 85, { align: 'center' });

    // Student name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(30, 41, 59);
    doc.text(studentName, w / 2, 100, { align: 'center' });

    // "has successfully completed"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('has successfully completed the course', w / 2, 115, { align: 'center' });

    // Course title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text(courseTitle, w / 2, 130, { align: 'center' });

    // Instructor and date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Instructor: ${tutorName}`, w / 2, 148, { align: 'center' });
    doc.text(`Date of Completion: ${completionDate}`, w / 2, 158, { align: 'center' });

    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(40, 175, w - 40, 175);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'TutorSphere Learning Platform — Empowering STEM Education',
      w / 2,
      185,
      { align: 'center' }
    );

    doc.save(`Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-amber-600" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Congratulations!</h2>
          <p className="text-slate-500 mb-8">You have successfully completed this course.</p>

          {/* Certificate Preview */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-8">
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-1">
              TUTORSPHERE
            </p>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Certificate of Completion</h3>
            <p className="text-slate-500 text-sm">This certifies that</p>
            <p className="text-2xl font-bold text-slate-900 my-2">{studentName}</p>
            <p className="text-slate-500 text-sm">has completed</p>
            <p className="text-lg font-bold text-indigo-600 my-2">{courseTitle}</p>
            <p className="text-xs text-slate-400 mt-4">
              Instructor: {tutorName} &bull; {completionDate}
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto"
          >
            <Download className="w-5 h-5" /> Download Certificate (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
