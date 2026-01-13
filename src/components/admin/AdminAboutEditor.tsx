'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Save, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import MarkdownEditor from '../ui/MarkdownEditor';
import type { About } from '@/lib/db/schema';

export default function AdminAboutEditor() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [heroQuote, setHeroQuote] = useState('');
  const [heroQuoteSource, setHeroQuoteSource] = useState('');
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/about');
      if (!response.ok) {
        throw new Error('Failed to fetch about');
      }
      const data = await response.json();
      if (data) {
        setHeroImageUrl(data.heroImageUrl || null);
        setHeroQuote(data.heroQuote || '');
        setHeroQuoteSource(data.heroQuoteSource || '');
        setContent(data.content || '');
      }
    } catch (error) {
      console.error('Error fetching about:', error);
      showError('Hakkımızda içeriği yüklenirken bir hata oluştu');
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

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('Lütfen bir resim dosyası seçin');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setHeroImageUrl(result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Resim yüklenirken bir hata oluştu');
    }
  };

  const handleRemoveImage = () => {
    setHeroImageUrl(null);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      showError('İçerik gereklidir');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heroImageUrl,
          heroQuote,
          heroQuoteSource,
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save about');
      }

      showSuccess('Hakkımızda içeriği başarıyla kaydedildi');
    } catch (error: any) {
      console.error('Error saving about:', error);
      showError(error.message || 'İçerik kaydedilirken bir hata oluştu');
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
                HAKKIMIZDA DÜZENLE
              </h1>
              <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
                İÇERİK YÖNETİMİ
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

          {/* Hero Image Upload */}
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              HERO FOTOĞRAF (OPSİYONEL)
            </label>
            
            {heroImageUrl ? (
              <div className="relative">
                <div className="border border-black/20 p-4 bg-[#F9F9F9]">
                  <img
                    src={heroImageUrl}
                    alt="Hero"
                    className="max-w-full h-auto max-h-96 mx-auto"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
                >
                  <X className="w-4 h-4" />
                  FOTOĞRAFI KALDIR
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed p-12 text-center transition-none ${
                  isDragging
                    ? 'border-[#1E3A5F] bg-[#F9F9F9]'
                    : 'border-black/20 bg-white'
                }`}
              >
                <input
                  type="file"
                  id="hero-image-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="hero-image-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <Upload className="w-12 h-12 text-[#1E3A5F]" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#1E3A5F] font-montserrat mb-2">
                      FOTOĞRAF YÜKLE
                    </p>
                    <p className="text-xs text-gray-600 font-sans">
                      Sürükle-bırak veya tıklayarak seçin
                    </p>
                    <p className="text-xs text-gray-500 font-sans mt-1">
                      PNG, JPG, SVG (Max 5MB)
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Hero Quote */}
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              HERO ALINTI (OPSİYONEL)
            </label>
            <textarea
              value={heroQuote}
              onChange={(e) => setHeroQuote(e.target.value)}
              className="w-full min-h-[100px] px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-serif text-lg leading-relaxed focus:outline-none focus:border-[#1E3A5F] transition-none resize-none"
              placeholder="Alıntı metni..."
            />
          </div>

          {/* Hero Quote Source */}
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              ALINTI KAYNAĞI (OPSİYONEL)
            </label>
            <input
              type="text"
              value={heroQuoteSource}
              onChange={(e) => setHeroQuoteSource(e.target.value)}
              className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
              placeholder="Alıntı kaynağı..."
            />
          </div>

          {/* Content Markdown Editor */}
          <MarkdownEditor
            value={content}
            onChange={setContent}
            label="İÇERİK (MARKDOWN)"
            placeholder="# Hakkımızda İçeriği

Buraya markdown formatında içerik yazabilirsiniz.

## Bölüm Başlığı

Paragraf metinleri...

**Kalın metin** ve *italik metin* kullanabilirsiniz."
          />
        </>
      )}
    </div>
  );
}
