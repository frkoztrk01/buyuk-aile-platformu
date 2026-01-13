'use client';

import { useState } from 'react';
import { Eye, Edit } from 'lucide-react';
import { markdownToHtml } from '@/lib/utils/markdown';

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

  // Simple markdown to HTML converter (basic)
  const markdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Code blocks (preserve)
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // Headers (order matters - do larger first)
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold (must come before italic)
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    
    // Paragraphs (split by double newline)
    html = html.split(/\n\n+/).map(para => {
      if (para.trim() && !para.match(/^<[h|u|o|l|p]/)) {
        return `<p>${para.trim()}</p>`;
      }
      return para;
    }).join('\n');
    
    // Single line breaks
    html = html.replace(/\n/gim, '<br />');
    
    return html;
  };

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
          <div className="min-h-[500px] px-4 py-3 prose prose-sm max-w-none">
            <div
              className="text-[#1E3A5F] font-sans text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
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
              <div
                className="text-[#1E3A5F] font-sans text-base leading-relaxed min-h-[500px]"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
