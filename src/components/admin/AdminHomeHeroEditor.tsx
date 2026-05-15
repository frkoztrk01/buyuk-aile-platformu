'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, X, Save, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import type { HomeHero } from '@/lib/db/schema';
import { withResolvedHomeHeroFields } from '@/lib/media-url';
import {
  HOME_HERO_DEFAULTS,
  mergeHomeHeroFromDb,
  bulletsToMultiline,
} from '@/lib/home-hero-defaults';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function AdminHomeHeroEditor() {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaHref, setCtaHref] = useState('');
  const [missionTitle, setMissionTitle] = useState('');
  const [missionBody, setMissionBody] = useState('');
  const [missionBullets, setMissionBullets] = useState('');
  const [visionTitle, setVisionTitle] = useState('');
  const [visionBody, setVisionBody] = useState('');
  const [visionBullets, setVisionBullets] = useState('');
  const [valuesTitle, setValuesTitle] = useState('');
  const [valuesBody, setValuesBody] = useState('');
  const [valuesBullets, setValuesBullets] = useState('');
  const [dragBg, setDragBg] = useState(false);
  const [dragLogo, setDragLogo] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/home-hero');
      if (!response.ok) throw new Error('fetch failed');
      const raw = (await response.json()) as HomeHero | null;
      const resolved = raw ? withResolvedHomeHeroFields(raw) : null;
      const merged = mergeHomeHeroFromDb(resolved);

      setBackgroundImageUrl(raw?.backgroundImageUrl?.trim() ? resolved!.backgroundImageUrl : null);
      setLogoUrl(raw?.logoUrl?.trim() ? resolved!.logoUrl : null);
      setHeadline(merged.headline);
      setSubtext(merged.subtext);
      setCtaLabel(merged.ctaLabel);
      setCtaHref(merged.ctaHref);
      setMissionTitle(merged.missionTitle);
      setMissionBody(merged.missionBody);
      setMissionBullets(bulletsToMultiline(merged.missionBullets));
      setVisionTitle(merged.visionTitle);
      setVisionBody(merged.visionBody);
      setVisionBullets(bulletsToMultiline(merged.visionBullets));
      setValuesTitle(merged.valuesTitle);
      setValuesBody(merged.valuesBody);
      setValuesBullets(bulletsToMultiline(merged.valuesBullets));
    } catch (e) {
      console.error(e);
      showError('Ana sayfa hero içeriği yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const readImageFile = (file: File, onDone: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      showError('Lütfen bir resim dosyası seçin');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showError("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => onDone(reader.result as string);
    reader.readAsDataURL(file);
  };

  const renderImageDrop = (
    id: string,
    label: string,
    value: string | null,
    fallback: string,
    onClear: () => void,
    onFile: (f: File) => void,
    dragging: boolean,
    setDrag: (v: boolean) => void
  ) => {
    const preview = value ?? fallback;
    return (
      <div className="bg-white border border-black/10 p-6">
        <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-4">
          {label}
        </label>
        {value ? (
          <div className="relative">
            <div className="border border-black/20 p-4 bg-[#F9F9F9]">
              <img src={preview} alt="" className="max-w-full h-auto max-h-72 mx-auto object-contain" />
            </div>
            <button
              type="button"
              onClick={onClear}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
            >
              <X className="w-4 h-4" />
              ÖZEL GÖRSELİ KALDIR (VARSAYILANA DÖN)
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const files = Array.from(e.dataTransfer.files);
              if (files[0]) onFile(files[0]);
            }}
            className={`border-2 border-dashed p-10 text-center transition-none ${
              dragging ? 'border-[#1E3A5F] bg-[#F9F9F9]' : 'border-black/20 bg-white'
            }`}
          >
            <p className="text-xs text-gray-600 mb-4 font-sans">
              Şu an site varsayılan görselini kullanıyor. Özel görsel için yükleyin.
            </p>
            <input type="file" id={id} accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }} />
            <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-[#1E3A5F]" />
              <span className="text-sm font-bold uppercase tracking-widest text-[#1E3A5F] font-montserrat">
                Görsel yükle
              </span>
              <span className="text-xs text-gray-500">PNG, JPG, SVG — en fazla 5MB</span>
            </label>
          </div>
        )}
      </div>
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/home-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backgroundImageUrl,
          logoUrl,
          headline,
          subtext,
          ctaLabel,
          ctaHref,
          missionTitle,
          missionBody,
          missionBullets,
          visionTitle,
          visionBody,
          visionBullets,
          valuesTitle,
          valuesBody,
          valuesBullets,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'save failed');
      }
      showSuccess('Ana sayfa hero kaydedildi');
      await load();
    } catch (e: unknown) {
      console.error(e);
      showError(e instanceof Error ? e.message : 'Kayıt sırasında hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

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
                Ana sayfa hero
              </h1>
              <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
                Arka plan, logo ve metinler
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
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Kaydet
                </>
              )}
            </button>
          </div>

          {renderImageDrop(
            'home-hero-bg',
            'Arka plan görseli',
            backgroundImageUrl,
            HOME_HERO_DEFAULTS.backgroundImageUrl,
            () => setBackgroundImageUrl(null),
            (f) => readImageFile(f, setBackgroundImageUrl),
            dragBg,
            setDragBg
          )}

          {renderImageDrop(
            'home-hero-logo',
            'Üst logo',
            logoUrl,
            HOME_HERO_DEFAULTS.logoUrl,
            () => setLogoUrl(null),
            (f) => readImageFile(f, setLogoUrl),
            dragLogo,
            setDragLogo
          )}

          <div className="bg-white border border-black/10 p-6 space-y-4">
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold">
              Ana başlık
            </label>
            <input
              className="w-full px-4 py-3 border border-black/20 text-[#1E3A5F] focus:outline-none focus:border-[#1E3A5F]"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
            <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold pt-2">
              Giriş metni
            </label>
            <textarea
              className="w-full min-h-[100px] px-4 py-3 border border-black/20 text-[#1E3A5F] focus:outline-none focus:border-[#1E3A5F] resize-y"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  Buton metni
                </label>
                <input
                  className="w-full px-4 py-3 border border-black/20 text-[#1E3A5F] focus:outline-none focus:border-[#1E3A5F]"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  Buton linki (ör. /hakkimizda)
                </label>
                <input
                  className="w-full px-4 py-3 border border-black/20 text-[#1E3A5F] focus:outline-none focus:border-[#1E3A5F]"
                  value={ctaHref}
                  onChange={(e) => setCtaHref(e.target.value)}
                />
              </div>
            </div>
          </div>

          {(
            [
              ['Misyon', missionTitle, setMissionTitle, missionBody, setMissionBody, missionBullets, setMissionBullets],
              ['Vizyon', visionTitle, setVisionTitle, visionBody, setVisionBody, visionBullets, setVisionBullets],
              ['Değerler', valuesTitle, setValuesTitle, valuesBody, setValuesBody, valuesBullets, setValuesBullets],
            ] as const
          ).map(([label, t, st, b, sb, bl, sbl]) => (
            <div key={label} className="bg-white border border-black/10 p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#1E3A5F] font-montserrat border-b border-black/10 pb-2">
                Sağ panel — {label}
              </h2>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-600 font-montserrat font-bold mb-2">
                  Küçük başlık
                </label>
                <input
                  className="w-full px-4 py-3 border border-black/20 text-[#1E3A5F] focus:outline-none focus:border-[#1E3A5F]"
                  value={t}
                  onChange={(e) => st(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-600 font-montserrat font-bold mb-2">
                  Paragraf
                </label>
                <textarea
                  className="w-full min-h-[80px] px-4 py-3 border border-black/20 text-[#1E3A5F] focus:outline-none focus:border-[#1E3A5F] resize-y"
                  value={b}
                  onChange={(e) => sb(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-600 font-montserrat font-bold mb-2">
                  Maddeler (her satır bir madde)
                </label>
                <textarea
                  className="w-full min-h-[100px] px-4 py-3 border border-black/20 text-[#1E3A5F] font-mono text-sm focus:outline-none focus:border-[#1E3A5F] resize-y"
                  value={bl}
                  onChange={(e) => sbl(e.target.value)}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
