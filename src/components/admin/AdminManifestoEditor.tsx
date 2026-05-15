'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Upload, X, FileText } from 'lucide-react';
import { useToast } from './useToast';

type PdfSlot = 'pdf1' | 'pdf2';

function PdfUploadField({
  label,
  sublabel,
  inputId,
  value,
  isUploading,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onRemove,
}: {
  label: string;
  sublabel: string;
  inputId: string;
  value: string | null;
  isUploading: boolean;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white border border-black/10 p-6">
      <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-1">
        {label}
      </label>
      <p className="text-xs text-gray-600 font-sans mb-4">{sublabel}</p>

      {isUploading ? (
        <div className="flex items-center justify-center py-12 border-2 border-dashed border-black/20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
            <p className="text-sm font-sans text-[#1E3A5F] font-semibold">PDF yükleniyor...</p>
          </div>
        </div>
      ) : value ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 border border-black/10">
            <FileText className="w-8 h-8 text-[#1E3A5F]" />
            <div className="flex-1">
              <p className="text-sm font-sans text-[#1E3A5F] font-semibold">PDF yüklendi</p>
            </div>
            <button
              onClick={onRemove}
              className="p-2 hover:bg-red-50 transition-none"
              type="button"
              aria-label="PDF kaldır"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
          <div className="border border-black/10" style={{ height: '480px' }}>
            <iframe src={value} className="w-full h-full" title={`${label} önizleme`} />
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed p-10 text-center transition-none ${
            isDragging ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' : 'border-black/20 hover:border-[#1E3A5F]/50'
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={onFileSelect}
            className="hidden"
            id={inputId}
            disabled={isUploading}
          />
          <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center gap-4">
            <Upload className="w-10 h-10 text-[#1E3A5F]" />
            <div>
              <p className="text-sm font-sans text-[#1E3A5F] font-semibold mb-1">
                Tıklayın veya sürükleyip bırakın
              </p>
              <p className="text-xs text-gray-600 font-sans">Maksimum 10MB</p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}

export default function AdminManifestoEditor() {
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfUrl2, setPdfUrl2] = useState<string | null>(null);
  const [pdf1Label, setPdf1Label] = useState('');
  const [pdf2Label, setPdf2Label] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState<PdfSlot | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<PdfSlot | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/manifesto')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setTitle(data.title || '');
          setPdfUrl(data.pdfUrl || null);
          setPdfUrl2(data.pdfUrl2 || null);
          setPdf1Label(data.pdf1Label || '');
          setPdf2Label(data.pdf2Label || '');
        }
      })
      .catch(() => showError('Manifesto içeriği yüklenirken bir hata oluştu'))
      .finally(() => setIsLoading(false));
  }, [showError]);

  const uploadPdf = async (file: File, slot: PdfSlot) => {
    if (file.type !== 'application/pdf') {
      showError('Lütfen bir PDF dosyası seçin');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }

    try {
      setUploadingSlot(slot);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Yükleme başarısız');
      }
      const { url } = await response.json();
      if (slot === 'pdf1') setPdfUrl(url);
      else setPdfUrl2(url);
      showSuccess('PDF yüklendi');
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'PDF yüklenirken hata oluştu');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError('Başlık gereklidir');
      return;
    }
    if (!pdfUrl && !pdfUrl2) {
      showError('En az bir PDF yükleyin');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/manifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, pdfUrl, pdfUrl2, pdf1Label, pdf2Label }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Kayıt başarısız');
      }
      showSuccess('Manifesto kaydedildi');
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Kayıt sırasında hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const slotProps = (slot: PdfSlot) => ({
    isUploading: uploadingSlot === slot,
    isDragging: draggingSlot === slot,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDraggingSlot(slot);
    },
    onDragLeave: () => setDraggingSlot(null),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDraggingSlot(null);
      const file = e.dataTransfer.files[0];
      if (file) uploadPdf(file, slot);
    },
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadPdf(file, slot);
    },
  });

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
          <p className="text-sm text-gray-600 font-sans">Yükleniyor...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
                MANİFESTO DÜZENLE
              </h1>
              <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
                İKİ PDF DOSYASI
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none disabled:opacity-50"
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

          <div className="bg-white border border-black/10 p-6">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
              SAYFA BAŞLIĞI
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat bg-transparent border-b-2 border-black/20 focus:outline-none focus:border-[#1E3A5F] pb-4"
              placeholder="MANİFESTO"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white border border-black/10 p-4">
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  1. PDF BAŞLIĞI (OPSİYONEL)
                </label>
                <input
                  type="text"
                  value={pdf1Label}
                  onChange={(e) => setPdf1Label(e.target.value)}
                  className="w-full px-3 py-2 border border-black/20 text-[#1E3A5F] font-sans text-sm focus:outline-none focus:border-[#1E3A5F]"
                  placeholder="Örn. Tam metin"
                />
              </div>
              <PdfUploadField
                label="1. PDF"
                sublabel="İlk manifesto dosyası"
                inputId="manifesto-pdf-1"
                value={pdfUrl}
                onRemove={() => setPdfUrl(null)}
                {...slotProps('pdf1')}
              />
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-black/10 p-4">
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  2. PDF BAŞLIĞI (OPSİYONEL)
                </label>
                <input
                  type="text"
                  value={pdf2Label}
                  onChange={(e) => setPdf2Label(e.target.value)}
                  className="w-full px-3 py-2 border border-black/20 text-[#1E3A5F] font-sans text-sm focus:outline-none focus:border-[#1E3A5F]"
                  placeholder="Örn. Özet / ek metin"
                />
              </div>
              <PdfUploadField
                label="2. PDF"
                sublabel="İkinci manifesto dosyası"
                inputId="manifesto-pdf-2"
                value={pdfUrl2}
                onRemove={() => setPdfUrl2(null)}
                {...slotProps('pdf2')}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
