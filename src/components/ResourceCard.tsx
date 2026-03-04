import { FileText, Download, Calendar } from 'lucide-react';
import { Resource } from '../types';
import { downloadResource } from '../services/downloadService';

interface ResourceCardProps {
  resource: Resource;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export default function ResourceCard({ resource, onDelete, canDelete }: ResourceCardProps) {
  const typeColors: Record<string, string> = {
    Paper: 'bg-blue-100 text-blue-700',
    Note: 'bg-emerald-100 text-emerald-700',
    Article: 'bg-purple-100 text-purple-700',
    PDF: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="bg-indigo-50 p-3 rounded-xl shrink-0">
          <FileText className="text-indigo-600 w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{resource.title}</h3>
          <p className="text-sm text-slate-500 truncate">{resource.description}</p>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                typeColors[resource.type] || 'bg-slate-100 text-slate-600'
              }`}
            >
              {resource.type}
            </span>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {resource.createdAt}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => downloadResource(resource.id, resource.title)}
          className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl hover:bg-indigo-100 transition-all"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(resource.id)}
            className="bg-rose-50 text-rose-500 px-3 py-2.5 rounded-xl hover:bg-rose-100 transition-all text-xs font-bold"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
