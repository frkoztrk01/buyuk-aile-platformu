'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import MarkdownEditor from '../ui/MarkdownEditor';
import type { Member } from '@/lib/db/schema';

interface AdminMembersEditorProps {
  mode?: 'create' | 'edit';
  memberId?: string;
  initialData?: Member;
}

export default function AdminMembersEditor({
  mode = 'create',
  memberId,
  initialData,
}: AdminMembersEditorProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState(initialData?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && memberId && !initialData) {
      fetchMember();
    }
  }, [mode, memberId]);

  const fetchMember = async () => {
    if (!memberId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/members/${memberId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch member');
      }
      const data = await response.json();
      setName(data.name || '');
    } catch (error) {
      console.error('Error fetching member:', error);
      showError('Üye yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Üye adı gereklidir');
      return;
    }

    try {
      setIsSaving(true);
      const url = mode === 'create' ? '/api/admin/members' : `/api/admin/members/${memberId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save member');
      }

      showSuccess(
        mode === 'create' ? 'Üye başarıyla oluşturuldu' : 'Üye başarıyla güncellendi'
      );
      
      setTimeout(() => {
        router.push('/admin/uyeler');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving member:', error);
      showError(error.message || 'Üye kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
            <p className="text-sm text-gray-600 font-sans">Yükleniyor...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
                {mode === 'create' ? 'YENİ ÜYE' : 'ÜYE DÜZENLE'}
              </h1>
              <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
                ÜYE YÖNETİMİ
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  KAYDEDİLİYOR...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  KAYDET
                </>
              )}
            </button>
          </div>

          {/* Markdown Editor for Member Names */}
          <MarkdownEditor
            value={name}
            onChange={setName}
            label="ÜYE ADI (MARKDOWN)"
            placeholder="# Üye Adı

**Kalın Üye Adı** veya *İtalik Üye Adı*

Veya sadece düz metin olarak üye adını yazabilirsiniz."
          />
        </>
      )}
    </div>
  );
}
