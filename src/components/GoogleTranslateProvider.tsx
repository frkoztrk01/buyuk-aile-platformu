"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type TranslateLang = "tr" | "en" | "ar";

type GoogleTranslateContextValue = {
  changeLanguage: (lang: TranslateLang) => void;
  currentLang: TranslateLang;
  isReady: boolean;
};

export const GoogleTranslateContext =
  createContext<GoogleTranslateContextValue | null>(null);

const SCRIPT_URL =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
const CONTAINER_ID = "google_translate_element";
const COOKIE_NAME = "googtrans";

function parseCurrentLang(): TranslateLang {
  if (typeof document === "undefined") return "tr";
  const m = document.cookie.match(new RegExp(`${COOKIE_NAME}=/tr/(\\w+)`));
  const lang = m ? (m[1] as TranslateLang) : "tr";
  return lang === "en" || lang === "ar" ? lang : "tr";
}

function setRtlDir(lang: TranslateLang) {
  if (typeof document === "undefined") return;
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.body.setAttribute("dir", dir);
}

function setGoogtransCookie(lang: TranslateLang) {
  if (typeof document === "undefined") return;
  const value = lang === "tr" ? "/tr/tr" : `/tr/${lang}`;
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=31536000`;
}

function triggerGoogTeCombo(lang: TranslateLang, retries = 3): void {
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  if (retries > 0) {
    setTimeout(() => triggerGoogTeCombo(lang, retries - 1), 400);
  }
}

export function GoogleTranslateProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState<TranslateLang>("tr");
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  const changeLanguage = useCallback((lang: TranslateLang) => {
    setCurrentLang(lang);
    setRtlDir(lang);
    setGoogtransCookie(lang);
    triggerGoogTeCombo(lang);
    if (typeof window !== "undefined") {
      setTimeout(() => window.location.reload(), 100);
    }
  }, []);

  useEffect(() => {
    const lang = parseCurrentLang();
    setCurrentLang(lang);
    setRtlDir(lang);
  }, []);

  // Hide Google Translate banner and widget
  useEffect(() => {
    const hideBanner = () => {
      // Hide all Google Translate elements
      const selectors = [
        '#google_translate_element',
        '.goog-te-banner-frame',
        '.skiptranslate',
        '.goog-te-banner',
        '.goog-te-menu-frame',
        '.goog-te-menu',
        '.goog-te-menu2',
        '.goog-te-menu-value',
        'iframe[title*="Google Translate"]',
        'iframe[name*="google_translate"]',
        'iframe[src*="translate.google.com"]',
        'div[id*="google_translate"]',
        'div[class*="goog-te"]',
        'span[class*="goog-te"]',
        'select[class*="goog-te"]',
        'select.goog-te-combo',
      ];

      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = 'none';
          htmlEl.style.visibility = 'hidden';
          htmlEl.style.opacity = '0';
          htmlEl.style.height = '0';
          htmlEl.style.width = '0';
          htmlEl.style.overflow = 'hidden';
          htmlEl.style.position = 'absolute';
          htmlEl.style.left = '-9999px';
          htmlEl.style.pointerEvents = 'none';
        });
      });

      // Remove top class from body
      document.body.classList.remove('top');
      document.body.style.top = '0';
      document.body.style.paddingTop = '0';
    };

    // Run immediately
    hideBanner();

    // Watch for new elements
    const observer = new MutationObserver(hideBanner);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also run on interval as backup
    const interval = setInterval(hideBanner, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (window as unknown as Record<string, () => void>).googleTranslateElementInit =
      function () {
        const el = document.getElementById(CONTAINER_ID);
        if (el?.querySelector(".goog-te-combo")) {
          setIsReady(true);
          return;
        }
        const w = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : null;
        const g = w?.google as Record<string, unknown> | undefined;
        const te = g?.translate as Record<string, unknown> | undefined;
        const Ctor = te?.TranslateElement;
        if (!Ctor) return;
        const layout = (Ctor as { InlineLayout?: { SIMPLE?: number } }).InlineLayout?.SIMPLE ?? 0;
        try {
          // Google Translate Element constructor (external script, no types)
          new (Ctor as any)({ pageLanguage: "tr", includedLanguages: "tr,en,ar", layout }, CONTAINER_ID);
        } catch {
          // ignore
        }
        setIsReady(true);
      };

    if (document.querySelector(`script[src*="translate.google.com"]`)) {
      const cb = (window as unknown as Record<string, () => void>).googleTranslateElementInit;
      if (typeof cb === "function") cb();
      return;
    }

    const s = document.createElement("script");
    s.src = SCRIPT_URL;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <GoogleTranslateContext.Provider
      value={{ changeLanguage, currentLang, isReady }}
    >
      <div 
        id={CONTAINER_ID} 
        aria-hidden="true" 
        style={{ 
          display: 'none', 
          visibility: 'hidden', 
          opacity: 0, 
          height: 0, 
          width: 0, 
          overflow: 'hidden',
          position: 'absolute',
          left: '-9999px',
          pointerEvents: 'none'
        }} 
      />
      {children}
    </GoogleTranslateContext.Provider>
  );
}
