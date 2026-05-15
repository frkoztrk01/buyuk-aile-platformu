'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Upload, X, FileText } from 'lucide-react';
import { useToast } from './useToast';
import type { Manifesto } from '@/lib/db/schema';

export default function AdminManifestoEditor() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchManifesto();
  }, []);

  const fetchManifesto = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/manifesto');
      if (!response.ok) {
        throw new Error('Failed to fetch manifesto');
      }
      const data = await response.json();
      if (data) {
        setTitle(data.title || '');
        setPdfUrl(data.pdfUrl || null);
      }
    } catch (error) {
      console.error('Error fetching manifesto:', error);
      showError('Manifesto Zaptı içeriği yüklenirken bir hata oluştu');
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
    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
      showError('Lütfen bir PDF dosyası seçin');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('Dosya boyutu 10MB\'dan küçük olmalıdır');
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload to S3 via API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload PDF');
      }

      const data = await response.json();
      setPdfUrl(data.url);
      showSuccess('Dosya başarıyla yüklendi');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showError(error.message || 'PDF yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePdf = () => {
    setPdfUrl(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Başlık gereklidir');
      return;
    }
    if (!pdfUrl) {
      showError('PDF dosyası gereklidir');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/manifesto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          pdfUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save manifesto');
      }

      showSuccess('Manifesto Zaptı içeriği başarıyla kaydedildi');
    } catch (error: any) {
      console.error('Error saving manifesto:', error);
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
                MANİFESTO DÜZENLE
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
              placeholder="MANİFESTO BAŞLIĞI"
            />
          </div>

          {/* PDF Upload Section */}
          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              PDF DOSYASI
            </label>
            
            {isUploading ? (
              <div className="flex items-center justify-center py-12 border-2 border-dashed border-black/20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
                  <p className="text-sm font-sans text-[#1E3A5F] font-semibold">
                    PDF S3'e yükleniyor...
                  </p>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-black/10">
                  <FileText className="w-8 h-8 text-[#1E3A5F]" />
                  <div className="flex-1">
                    <p className="text-sm font-sans text-[#1E3A5F] font-semibold">PDF dosyası yüklendi</p>
                    <p className="text-xs text-gray-600 font-sans mt-1">S3'te saklanıyor</p>
                  </div>
                  <button
                    onClick={handleRemovePdf}
                    className="p-2 hover:bg-red-50 transition-none"
                    type="button"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
                <div className="border border-black/10" style={{ height: '600px' }}>
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed p-12 text-center transition-none ${
                  isDragging
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/5'
                    : 'border-black/20 hover:border-[#1E3A5F]/50'
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="pdf-upload"
                  className={`cursor-pointer flex flex-col items-center gap-4 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-12 h-12 text-[#1E3A5F]" />
                  <div>
                    <p className="text-sm font-sans text-[#1E3A5F] font-semibold mb-1">
                      PDF dosyası yüklemek için tıklayın veya sürükleyip bırakın
                    </p>
                    <p className="text-xs text-gray-600 font-sans">
                      Maksimum dosya boyutu: 10MB
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
