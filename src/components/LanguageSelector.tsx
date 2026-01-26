"use client";

import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import {
  GoogleTranslateContext,
  type TranslateLang,
} from "./GoogleTranslateProvider";

const LANGS: { value: TranslateLang; label: string }[] = [
  { value: "tr", label: "TR" },
  { value: "en", label: "EN" },
  { value: "ar", label: "AR" },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'navbar';
}

export default function LanguageSelector({ variant = 'default' }: LanguageSelectorProps) {
  const ctx = useContext(GoogleTranslateContext);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number; minWidth: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const onSelect = useCallback(
    (lang: TranslateLang) => {
      ctx?.changeLanguage(lang);
      setOpen(false);
      setPosition(null);
    },
    [ctx]
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPosition(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => {
      setOpen(false);
      setPosition(null);
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || typeof document === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
      minWidth: rect.width,
    });
  }, [open]);

  useEffect(() => {
    if (!open) setPosition(null);
  }, [open]);

  if (!ctx) return null;

  const current = LANGS.find((l) => l.value === ctx.currentLang) ?? LANGS[0];

  const dropdown = open && (
    <div
      role="listbox"
      aria-labelledby="language-selector-trigger"
      translate="no"
      className="notranslate fixed rounded-xl border border-gray-100 bg-white py-1 z-[100] overflow-visible"
      style={{
        top: position?.top ?? -9999,
        right: position?.right ?? 0,
        minWidth: position?.minWidth ?? 0,
        boxShadow: "none",
        visibility: position ? "visible" : "hidden",
      }}
    >
      {LANGS.map(({ value, label }) => (
        <button
          key={value}
          role="option"
          aria-selected={ctx.currentLang === value}
          type="button"
          translate="no"
          onClick={() => onSelect(value)}
          className={`notranslate w-full text-left px-3 py-2.5 text-sm transition-colors first:rounded-t-[11px] last:rounded-b-[11px] ${
            ctx.currentLang === value
              ? "text-[#00a7a7] font-medium bg-[#00a7a7]/10"
              : "text-gray-700 hover:bg-gray-50 hover:text-[#00a7a7]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div
      ref={ref}
      className="relative hidden lg:flex notranslate"
      aria-label="Dil seçin"
    >
      <button
        ref={triggerRef}
        type="button"
        translate="no"
        onClick={() => setOpen((o) => !o)}
        className={`notranslate flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors ${
          variant === 'navbar'
            ? 'border border-white/20 text-sm text-white hover:bg-white hover:text-[#336699] hover:border-white'
            : 'border border-gray-100 text-sm text-gray-700 hover:text-[#00a7a7] hover:border-gray-200'
        }`}
        style={{ boxShadow: "none" }}
        aria-expanded={open}
        aria-haspopup="listbox"
        id="language-selector-trigger"
      >
        <span>{current.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""} ${
            variant === 'navbar' ? 'text-white' : ''
          }`}
        />
      </button>

      {typeof document !== "undefined" && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}
