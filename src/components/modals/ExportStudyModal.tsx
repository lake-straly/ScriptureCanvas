import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  X,
  BookOpen
} from 'lucide-react';
import { ResizableModal } from '../ui/ResizableModal';
import type { CanvasNode, Connection } from '../../types';
import { generateStudyMarkdown, downloadStudyMarkdown } from '../../services/exportMarkdown';

interface ExportStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  nodes: Record<string, CanvasNode>;
  connections: Connection[];
}

export const ExportStudyModal: React.FC<ExportStudyModalProps> = ({
  isOpen,
  onClose,
  roomTitle,
  nodes,
  connections,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('options');

  if (!isOpen) return null;

  const markdownContent = generateStudyMarkdown(roomTitle, nodes, connections);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadStudyMarkdown(roomTitle, markdownContent);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${roomTitle} - Scripture Study</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
            h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            h2 { color: #1e293b; margin-top: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
            blockquote { background: #f8fafc; border-left: 4px solid #38bdf8; margin: 16px 0; padding: 8px 16px; font-style: italic; }
            hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
            code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
          </style>
        </head>
        <body>
          <pre style="white-space: pre-wrap; font-family: inherit;">${markdownContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <ResizableModal defaultWidth={580} onBackdropClick={onClose}>
      <div className="w-full h-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Export Study Notes</h2>
              <p className="text-xs text-slate-400">Share or save your visual study session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('options')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'options'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Export Options
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Markdown Preview
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'options' ? (
            <div className="space-y-3">
              {/* Markdown Download Card */}
              <div
                onClick={handleDownload}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-950 transition-all cursor-pointer group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                      Download Markdown (.md)
                    </h3>
                    <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">
                      Obsidian / Notion
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Exports passages, highlights, Strong's Greek/Hebrew entries, commentaries, and connection links.
                  </p>
                </div>
              </div>

              {/* Copy to Clipboard Card */}
              <div
                onClick={handleCopy}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-950 transition-all cursor-pointer group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                    </h3>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      Paste Anywhere
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Instantly copy structured study notes formatted for Google Docs, Word, or messaging apps.
                  </p>
                </div>
              </div>

              {/* Print / Save as PDF */}
              <div
                onClick={handlePrint}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950 transition-all cursor-pointer group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Printer className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      Print / Save as PDF
                    </h3>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                      Study Handouts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Opens a clean, printable document view suitable for physical handouts or PDF saving.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex-1 min-h-[260px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
              {markdownContent}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Includes {Object.keys(nodes).length} study cards & {connections.length} links</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </ResizableModal>
  );
};
