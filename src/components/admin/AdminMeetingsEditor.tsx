'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import type { Meeting } from '@/lib/db/schema';

interface AdminMeetingsEditorProps {
  mode?: 'create' | 'edit';
  meetingId?: string;
  initialData?: Meeting;
}

export default function AdminMeetingsEditor({
  mode = 'create',
  meetingId,
  initialData,
}: AdminMeetingsEditorProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState(initialData?.title || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [orderIndex, setOrderIndex] = useState(initialData?.orderIndex || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && meetingId && !initialData) {
      fetchMeeting();
    }
  }, [mode, meetingId]);

  const fetchMeeting = async () => {
    if (!meetingId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/meetings/${meetingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meeting');
      }
      const data = await response.json();
      setTitle(data.title);
      setVideoUrl(data.videoUrl || '');
      setDescription(data.description || '');
      setDate(new Date(data.date).toISOString().split('T')[0]);
      setOrderIndex(data.orderIndex || 0);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      showError('Buluşma yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Başlık gereklidir');
      return;
    }
    if (mode === 'edit' && !meetingId?.trim()) {
      showError('Buluşma kimliği bulunamadı; sayfayı yenileyin.');
      return;
    }

    try {
      setIsSaving(true);
      const url = mode === 'create' ? '/api/admin/meetings' : `/api/admin/meetings/${meetingId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          videoUrl: videoUrl || null,
          description: description || null,
          date: new Date(date).toISOString(),
          orderIndex: parseInt(String(orderIndex), 10) || 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save meeting');
      }

      showSuccess(
        mode === 'create' ? 'Buluşma başarıyla oluşturuldu' : 'Buluşma başarıyla güncellendi'
      );
      
      setTimeout(() => {
        router.push('/admin/bulusmalar');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving meeting:', error);
      showError(error.message || 'Buluşma kaydedilirken bir hata oluştu');
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
                {mode === 'create' ? 'YENİ BULUŞMA' : 'BULUŞMA DÜZENLE'}
              </h1>
              <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
                BULUŞMA YÖNETİMİ
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

          {/* Title Input */}
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              BAŞLIK
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat bg-transparent border-b-2 border-black/20 focus:outline-none focus:border-[#1E3A5F] transition-none pb-4"
              placeholder="BULUŞMA BAŞLIĞI"
            />
          </div>

          {/* Video URL Input */}
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              VİDEO LİNKİ (OPSİYONEL)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="mt-2 text-xs text-gray-500 font-sans">
              YouTube linki veya herhangi bir video URL'si
            </p>
          </div>

          {/* Description Textarea */}
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              AÇIKLAMA
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[200px] px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans text-base leading-relaxed focus:outline-none focus:border-[#1E3A5F] transition-none resize-none"
              placeholder="Buluşma açıklamasını buraya yazın..."
            />
          </div>

          {/* Date and Order Index */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Input */}
            <div className="bg-white border border-black/10 p-6">
              <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
                TARİH
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
              />
            </div>

            {/* Order Index Input */}
            <div className="bg-white border border-black/10 p-6">
              <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
                SIRALAMA
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
                className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
                placeholder="0"
              />
              <p className="mt-2 text-xs text-gray-500 font-sans">
                Düşük sayılar önce gösterilir
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
