'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Save, Loader2, Eye } from 'lucide-react';
import { useToast } from './useToast';
import type { News } from '@/lib/db/schema';
import { slugifyNewsTitle } from '@/lib/slugify-news';

interface AdminContentEditorProps {
  mode?: 'create' | 'edit';
  newsId?: string;
  initialData?: News;
  /** Haber/Duyuru vs yalnızca Etkinlik kayıtları */
  contentKind?: 'news' | 'event';
}

export default function AdminContentEditor({
  mode = 'create',
  newsId,
  initialData,
  contentKind = 'news',
}: AdminContentEditorProps) {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToast();
  const isEvent = contentKind === 'event';
  const redirectAfterSave = isEvent ? '/admin/etkinlikler' : '/admin/haberler';
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(
    initialData?.category || (isEvent ? 'Etkinlik' : '')
  );
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEvent) {
      setCategory('Etkinlik');
    }
  }, [isEvent]);

  useEffect(() => {
    if (mode === 'edit' && newsId && !initialData) {
      fetchNews();
    }
  }, [mode, newsId]);

  const fetchNews = async () => {
    if (!newsId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/news/${newsId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      if (!isEvent && data.category === 'Etkinlik') {
        showError('Bu içerik etkinlik olarak yönetilir.');
        router.push(`/admin/etkinlikler/${newsId}/duzenle`);
        return;
      }
      if (isEvent && data.category !== 'Etkinlik') {
        showError('Bu içerik etkinlik kategorisinde değil.');
        router.push('/admin/etkinlikler');
        return;
      }
      setTitle(data.title);
      setContent(data.content);
      setCategory(isEvent ? 'Etkinlik' : data.category);
      setDate(new Date(data.date).toISOString().split('T')[0]);
      setIsPublished(data.isPublished);
      setUploadedImage(data.imageUrl || null);
    } catch (error) {
      console.error('Error fetching news:', error);
      showError(
        isEvent ? 'Etkinlik yüklenirken bir hata oluştu' : 'Haber yüklenirken bir hata oluştu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        showSuccess('Görsel yüklendi');
      };
      reader.readAsDataURL(file);
    } else {
      showError('Lütfen geçerli bir görsel dosyası seçin');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        showSuccess('Görsel yüklendi');
      };
      reader.readAsDataURL(file);
    } else {
      showError('Lütfen geçerli bir görsel dosyası seçin');
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Başlık gereklidir');
      return;
    }
    if (!content.trim()) {
      showError('İçerik gereklidir');
      return;
    }
    const effectiveCategory = isEvent ? 'Etkinlik' : category;
    if (!effectiveCategory) {
      showError('Kategori gereklidir');
      return;
    }

    try {
      setIsSaving(true);
      const url = mode === 'create' ? '/api/admin/news' : `/api/admin/news/${newsId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug: slugifyNewsTitle(title),
          content,
          imageUrl: uploadedImage,
          category: effectiveCategory,
          date,
          isPublished,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const fallback = isEvent
          ? mode === 'create'
            ? 'Etkinlik kaydedilemedi'
            : 'Etkinlik güncellenemedi'
          : mode === 'create'
            ? 'Haber kaydedilemedi'
            : 'Haber güncellenemedi';
        throw new Error(error.error || fallback);
      }

      await response.json();
      showSuccess(
        isEvent
          ? mode === 'create'
            ? 'Etkinlik başarıyla oluşturuldu'
            : 'Etkinlik başarıyla güncellendi'
          : mode === 'create'
            ? 'Haber başarıyla oluşturuldu'
            : 'Haber başarıyla güncellendi'
      );
      
      setTimeout(() => {
        router.push(redirectAfterSave);
      }, 1000);
    } catch (error: any) {
      console.error('Error saving news:', error);
      showError(
        error.message ||
          (isEvent ? 'Etkinlik kaydedilirken bir hata oluştu' : 'Haber kaydedilirken bir hata oluştu')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    // TODO: Open preview in new tab or modal
    showInfo('Önizleme özelliği yakında eklenecek');
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
            <p className="text-sm text-gray-600 font-sans">
              {isEvent ? 'Etkinlik yükleniyor...' : 'Yükleniyor...'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
                {isEvent
                  ? mode === 'create'
                    ? 'YENİ ETKİNLİK'
                    : 'ETKİNLİK DÜZENLE'
                  : mode === 'create'
                    ? 'YENİ HABER'
                    : 'HABER DÜZENLE'}
              </h1>
              <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
                {isEvent ? 'ETKİNLİK YÖNETİMİ' : 'İÇERİK YÖNETİMİ'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-6 py-3 border border-[#1E3A5F] text-[#1E3A5F] text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#1E3A5F] hover:text-white transition-none"
              >
                <Eye className="w-4 h-4" />
                ÖNİZLEME
              </button>
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

      {/* Title Input */}
      <div className="bg-white border border-black/10 p-6">
        <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
          BAŞLIK
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat bg-transparent border-b-2 border-black/20 focus:outline-none focus:border-[#1E3A5F] transition-none pb-4"
          placeholder={isEvent ? 'ETKİNLİK BAŞLIĞI' : 'HABER BAŞLIĞI'}
        />
      </div>

          {/* Category and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isEvent && (
              <div className="bg-white border border-black/10 p-6">
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
                  KATEGORİ
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
                >
                  <option value="">Kategori Seçin</option>
                  <option value="Haber">Haber</option>
                  <option value="Duyuru">Duyuru</option>
                </select>
              </div>
            )}
            {isEvent && (
              <div className="bg-white border border-black/10 p-6">
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
                  KATEGORİ
                </label>
                <p className="w-full px-4 py-3 border border-black/20 bg-gray-50 text-[#1E3A5F] font-sans font-semibold">
                  Etkinlik
                </p>
              </div>
            )}
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
          </div>

          {/* Publish Toggle */}
          <div className="bg-white border border-black/10 p-6">
            <label className="flex items-center gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 border border-black/20 text-[#1E3A5F] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold">
                YAYINLA
              </span>
            </label>
          </div>

      {/* Image Upload */}
      <div className="bg-white border border-black/10 p-6">
        <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
          GÖRSEL
        </label>
        {uploadedImage ? (
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="w-full h-auto max-h-96 object-cover border border-black/10"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-4 right-4 p-2 bg-[#1E3A5F] text-white hover:bg-[#152A47] transition-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border border-dashed border-black/20 p-12 text-center
              ${isDragging ? 'bg-[#1E3A5F]/5 border-[#1E3A5F]' : 'bg-transparent'}
              transition-none
            `}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat mb-2">
              GÖRSEL SÜRÜKLEYİN VEYA
            </p>
            <label className="inline-block px-6 py-3 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none cursor-pointer">
              DOSYA SEÇ
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Rich Text Editor */}
      <div className="bg-white border border-black/10 p-6">
        <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
          İÇERİK
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[400px] px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans text-base leading-relaxed focus:outline-none focus:border-[#1E3A5F] transition-none resize-none"
          placeholder={
            isEvent ? 'Etkinlik açıklamasını buraya yazın...' : 'Haber içeriğini buraya yazın...'
          }
        />
          <p className="mt-2 text-xs text-gray-500 font-sans">
            Not: Gerçek uygulamada burada zengin metin editörü (TinyMCE, Quill, vb.) kullanılacaktır.
          </p>
        </div>
        </>
      )}
    </div>
  );
}
