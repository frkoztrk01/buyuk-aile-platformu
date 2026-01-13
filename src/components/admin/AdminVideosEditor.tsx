'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Eye } from 'lucide-react';
import { useToast } from './useToast';
import { getYouTubeEmbedUrl, extractYouTubeId } from '@/lib/utils/youtube';
import type { Video } from '@/lib/db/schema';

interface AdminVideosEditorProps {
  mode?: 'create' | 'edit';
  videoId?: string;
  initialData?: Video;
}

export default function AdminVideosEditor({
  mode = 'create',
  videoId,
  initialData,
}: AdminVideosEditorProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState(initialData?.title || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtubeUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && videoId && !initialData) {
      fetchVideo();
    }
  }, [mode, videoId]);

  const fetchVideo = async () => {
    if (!videoId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/videos/${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }
      const data = await response.json();
      setTitle(data.title);
      setYoutubeUrl(data.youtubeUrl);
    } catch (error) {
      console.error('Error fetching video:', error);
      showError('Video yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Başlık gereklidir');
      return;
    }
    if (!youtubeUrl.trim()) {
      showError('YouTube linki gereklidir');
      return;
    }

    // Validate YouTube URL
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      showError('Geçerli bir YouTube linki giriniz');
      return;
    }

    try {
      setIsSaving(true);
      const url = mode === 'create' ? '/api/admin/videos' : `/api/admin/videos/${videoId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          youtubeUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save video');
      }

      showSuccess(
        mode === 'create' ? 'Video başarıyla oluşturuldu' : 'Video başarıyla güncellendi'
      );
      
      setTimeout(() => {
        router.push('/admin/videolar');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving video:', error);
      showError(error.message || 'Video kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const embedUrl = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;
  const isValidUrl = youtubeUrl ? extractYouTubeId(youtubeUrl) !== null : false;

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
                {mode === 'create' ? 'YENİ VİDEO' : 'VİDEO DÜZENLE'}
              </h1>
              <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
                VİDEO YÖNETİMİ
              </p>
            </div>
            <div className="flex gap-2">
              {embedUrl && isValidUrl && (
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-gray-700 transition-none"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'ÖNİZLEMEYİ KAPAT' : 'ÖNİZLEME'}
                </button>
              )}
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Title Input */}
              <div className="bg-white border border-black/10 p-6">
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
                  VİDEO BAŞLIĞI
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-2xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat bg-transparent border-b-2 border-black/20 focus:outline-none focus:border-[#1E3A5F] transition-none pb-4"
                  placeholder="VİDEO BAŞLIĞI"
                />
              </div>

              {/* YouTube URL Input */}
              <div className="bg-white border border-black/10 p-6">
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
                  YOUTUBE LİNKİ
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className={`w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none transition-none ${
                    youtubeUrl && !isValidUrl
                      ? 'border-[#1E3A5F]'
                      : 'focus:border-[#1E3A5F]'
                  }`}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {youtubeUrl && !isValidUrl && (
                  <p className="mt-2 text-xs text-[#1E3A5F] font-sans">
                    Geçerli bir YouTube linki giriniz
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 font-sans">
                  Örnek: https://www.youtube.com/watch?v=VIDEO_ID veya https://youtu.be/VIDEO_ID
                </p>
              </div>
            </div>

            {/* Right Column - Preview */}
            {showPreview && embedUrl && isValidUrl && (
              <div className="bg-white border border-black/10 p-6">
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
                  ÖNİZLEME
                </label>
                <div className="aspect-video w-full border border-black/10">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title || 'Video Preview'}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
