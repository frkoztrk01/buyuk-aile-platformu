'use client';

import { useState } from 'react';
import { Eye, Edit } from 'lucide-react';
import MarkdownContent from './MarkdownContent';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Markdown içeriğini buraya yazın...',
  label,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');

  return (
    <div className="bg-white border border-black/10">
      {label && (
        <div className="p-4 border-b border-black/10 flex items-center justify-between">
          <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold">
            {label}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-widest font-montserrat transition-none ${
                viewMode === 'edit'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-transparent text-[#1E3A5F] border border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'
              }`}
            >
              <Edit className="w-3 h-3 inline mr-1" />
              DÜZENLE
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-widest font-montserrat transition-none ${
                viewMode === 'preview'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-transparent text-[#1E3A5F] border border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3 inline mr-1" />
              ÖNİZLEME
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-widest font-montserrat transition-none ${
                viewMode === 'split'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-transparent text-[#1E3A5F] border border-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'
              }`}
            >
              BÖL
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        {viewMode === 'edit' && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[500px] px-4 py-3 border-0 bg-white text-[#1E3A5F] font-mono text-sm leading-relaxed focus:outline-none transition-none resize-none"
            placeholder={placeholder}
          />
        )}

        {viewMode === 'preview' && (
          <div className="min-h-[500px] px-4 py-3">
            <MarkdownContent
              content={value}
              className="text-[#1E3A5F] font-sans text-base leading-relaxed"
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-2 gap-0 border-t border-black/10">
            <div className="border-r border-black/10">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full min-h-[500px] px-4 py-3 border-0 bg-white text-[#1E3A5F] font-mono text-sm leading-relaxed focus:outline-none transition-none resize-none"
                placeholder={placeholder}
              />
            </div>
            <div className="px-4 py-3 overflow-y-auto">
              <MarkdownContent
                content={value}
                className="text-[#1E3A5F] font-sans text-base leading-relaxed min-h-[500px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
