'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Save, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import type { Founder } from '@/lib/db/schema';

interface AdminFoundersEditorProps {
  mode?: 'create' | 'edit';
  founderId?: string;
  initialData?: Founder;
}

export default function AdminFoundersEditor({
  mode = 'create',
  founderId,
  initialData,
}: AdminFoundersEditorProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData?.logoUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && founderId && !initialData) {
      fetchFounder();
    }
  }, [mode, founderId]);

  const fetchFounder = async () => {
    if (!founderId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/founders/${founderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch founder');
      }
      const data = await response.json();
      setLogoUrl(data.logoUrl || null);
    } catch (error) {
      console.error('Error fetching founder:', error);
      showError('Kurucu kuruluş yüklenirken bir hata oluştu');
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
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      showError('Lütfen bir resim dosyası seçin');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    try {
      // In a real application, you would upload to a cloud storage service
      // For now, we'll use a data URL (base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Logo yüklenirken bir hata oluştu');
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleSave = async () => {
    if (!logoUrl) {
      showError('Logo gereklidir');
      return;
    }

    try {
      setIsSaving(true);
      const url = mode === 'create' ? '/api/admin/founders' : `/api/admin/founders/${founderId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save founder');
      }

      showSuccess(
        mode === 'create' ? 'Kurucu kuruluş başarıyla oluşturuldu' : 'Kurucu kuruluş başarıyla güncellendi'
      );
      
      setTimeout(() => {
        router.push('/admin/kurucu-kuruluslar');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving founder:', error);
      showError(error.message || 'Kurucu kuruluş kaydedilirken bir hata oluştu');
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
                {mode === 'create' ? 'YENİ KURUCU KURULUŞ' : 'KURUCU KURULUŞ DÜZENLE'}
              </h1>
              <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
                KURUCU KURULUŞ YÖNETİMİ
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

          {/* Logo Upload */}
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              LOGO
            </label>
            
            {logoUrl ? (
              <div className="relative">
                <div className="border border-black/20 p-4 bg-[#F9F9F9]">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="max-w-full h-auto max-h-64 mx-auto"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
                >
                  <X className="w-4 h-4" />
                  LOGOYU KALDIR
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
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <Upload className="w-12 h-12 text-[#1E3A5F]" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#1E3A5F] font-montserrat mb-2">
                      LOGO YÜKLE
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
        </>
      )}
    </div>
  );
}
