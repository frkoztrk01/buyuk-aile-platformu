import type { HomeHero } from '@/lib/db/schema';

/** Varsayılan metin ve görseller (DB kaydı yoksa veya alan boşsa kullanılır). Basın açıklaması (#temizekranhareketi) özetine dayanır. */
export const HOME_HERO_DEFAULTS = {
  backgroundImageUrl: '/images/banner.jpg',
  logoUrl: '/images/hero-section-logo.svg',
  headline: 'TEMİZ EKRAN, ÖZGÜR NESİL',
  subtext:
    'Tehlike artık ekranlar üzerinden geliyor; hedefte çocuklarımız, zihinlerimiz, değerlerimiz ve geleceğimiz var. #temizekranhareketi ile kültürel emperyalizm saldırılarına karşı duruyor, aileyi ve nesilleri koruma iradesini büyütüyoruz.',
  ctaLabel: 'MANİFESTO VE ÇAĞRI METNİ',
  ctaHref: '/hakkimizda',
  missionTitle: 'MİSYON',
  missionBody:
    'Ekranlar üzerinden evlerimizin ortasına saçılan saldırılarla aile zayıflatılmakta; çocukların ve gençlerin gelişimini olumsuz etkileyen içerikler, mahremiyet ihlalleri ve şiddet ile bağımlılıklar normalleştirilmektedir. Bu mesele yalnızca bir yayıncılık tercihi veya reyting yarışı değil; toplumsal yapının çözülmesi, nesillerin kaybı ve milli güvenlik meselesidir.',
  missionBullets: [
    'Şiddetin, suçun ve mafyanın özendirilmesini istemiyoruz',
    'Aileyi değersizleştiren senaryolar ile mahremiyeti ihlal eden programları reddediyoruz',
    'Reyting uğruna değerlerimizin ayaklar altına alınmasına izin vermiyoruz',
  ],
  visionTitle: 'VİZYON',
  visionBody:
    'Temiz ekran, özgür nesil; temiz ekran, özgür vatan. Başta RTÜK ve İletişim Başkanlığı olmak üzere ilgili tüm kurumların görevinin yanında sorumlu yayıncılığı, etkin denetimi ve aile ile çocuk dostu içeriklerin en güçlü biçimde teşvik edilmesini savunuyoruz.',
  visionBullets: [
    'Reytingi ve reklam gelirini tek ölçüt olmaktan çıkaran düzenlemeler',
    'Zararlı içeriklere karşı daha etkin denetim mekanizmaları',
    'Sorumlu reklamverenler ve sağduyulu yayıncılık kültürü',
  ],
  valuesTitle: 'DEĞERLER',
  valuesBody:
    '#temizekranhareketi; toplum mühendisliğine geçit vermeme kararlılığıdır. Ecdadımızın emaneti bu vatan ve evlatlarımız için ekranlardan gelen kültürel işgale karşı aynı azimle duruyoruz.',
  valuesBullets: [
    'Sorumlu yayıncılık çağrısı',
    'Aileyi, nesilleri ve milletimizin geleceğini koruma iradesi',
    'Kamuoyuna saygıyla, birlik ve şeffaflık',
  ],
} as const;

export type MergedHomeHero = {
  backgroundImageUrl: string;
  logoUrl: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  missionTitle: string;
  missionBody: string;
  missionBullets: string[];
  visionTitle: string;
  visionBody: string;
  visionBullets: string[];
  valuesTitle: string;
  valuesBody: string;
  valuesBullets: string[];
};

/** Varsayılan şerit logo değilse (admin’den yüklenen afiş/poster vb.) */
export function isCustomHeroLogo(logoUrl: string): boolean {
  return logoUrl.trim() !== HOME_HERO_DEFAULTS.logoUrl;
}

export function bulletsToMultiline(lines: readonly string[]): string {
  return lines.join('\n');
}

export function multilineToBullets(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickBullets(stored: string | null | undefined, fallback: readonly string[]): string[] {
  if (stored == null || stored.trim() === '') return [...fallback];
  const parsed = multilineToBullets(stored);
  return parsed.length > 0 ? parsed : [...fallback];
}

/** API/DB satırı ile varsayılanları birleştirir (boş alan varsayılanla dolar). */
export function mergeHomeHeroFromDb(row: HomeHero | null): MergedHomeHero {
  const d = HOME_HERO_DEFAULTS;
  if (!row) {
    return {
      backgroundImageUrl: d.backgroundImageUrl,
      logoUrl: d.logoUrl,
      headline: d.headline,
      subtext: d.subtext,
      ctaLabel: d.ctaLabel,
      ctaHref: d.ctaHref,
      missionTitle: d.missionTitle,
      missionBody: d.missionBody,
      missionBullets: [...d.missionBullets],
      visionTitle: d.visionTitle,
      visionBody: d.visionBody,
      visionBullets: [...d.visionBullets],
      valuesTitle: d.valuesTitle,
      valuesBody: d.valuesBody,
      valuesBullets: [...d.valuesBullets],
    };
  }
  return {
    backgroundImageUrl: row.backgroundImageUrl?.trim() || d.backgroundImageUrl,
    logoUrl: row.logoUrl?.trim() || d.logoUrl,
    headline: row.headline?.trim() || d.headline,
    subtext: row.subtext?.trim() || d.subtext,
    ctaLabel: row.ctaLabel?.trim() || d.ctaLabel,
    ctaHref: row.ctaHref?.trim() || d.ctaHref,
    missionTitle: row.missionTitle?.trim() || d.missionTitle,
    missionBody: row.missionBody?.trim() || d.missionBody,
    missionBullets: pickBullets(row.missionBullets, d.missionBullets),
    visionTitle: row.visionTitle?.trim() || d.visionTitle,
    visionBody: row.visionBody?.trim() || d.visionBody,
    visionBullets: pickBullets(row.visionBullets, d.visionBullets),
    valuesTitle: row.valuesTitle?.trim() || d.valuesTitle,
    valuesBody: row.valuesBody?.trim() || d.valuesBody,
    valuesBullets: pickBullets(row.valuesBullets, d.valuesBullets),
  };
}
