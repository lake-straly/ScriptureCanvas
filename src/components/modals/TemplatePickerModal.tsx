import { STUDY_TEMPLATES } from '../../data/templates';
import type { StudyTemplate } from '../../data/templates';
import { LayoutGrid, X, ArrowRight, Sparkles, PlusCircle } from 'lucide-react';
import { ResizableModal } from '../ui/ResizableModal';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StudyTemplate | null) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <ResizableModal defaultWidth={680} onBackdropClick={onClose}>
      <div className="w-full h-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Study Canvases & Templates</h2>
              <p className="text-xs text-slate-400">Load interactive pre-structured studies or start clean</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STUDY_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl);
                onClose();
              }}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-slate-800/30 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {tmpl.badge}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-200">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-indigo-400 font-medium">
                <span>Load Canvas</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}

          {/* Blank Canvas Option */}
          <div
            onClick={() => {
              onSelectTemplate(null);
              onClose();
            }}
            className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 hover:border-slate-600 hover:bg-slate-800/20 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Fresh Board
              </span>
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-slate-200">
                Blank Study Canvas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Start with an empty board to drop your own chosen passages, notes, and connections from scratch.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-medium group-hover:text-slate-300">
              <span>Create Empty Canvas</span>
              <PlusCircle className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </ResizableModal>
  );
};
