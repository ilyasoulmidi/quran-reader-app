// ---------------------------------------------------------------------------
//  API mp3quran.net (v3) — mêmes endpoints que le projet d'origine
// ---------------------------------------------------------------------------
//  GET /api/v3/suwar?language=ar|eng|fr        -> { suwar: [{id,name,start_page,end_page,makkia,type}] }
//  GET /api/v3/ayat_timing/reads               -> [{id,name,rewaya,folder_url,soar_count,soar_link}]
//  GET /api/v3/ayat_timing?surah=S&read=R      -> [{ayah,polygon,start_time,end_time,x,y,page}]
//  GET /api/v3/radios?language=ar|eng|fr       -> { radios: [{id,name,url,recent_date}] }
//  GET /api/quran_pages_svg/NNN.svg            -> page du mushaf (1..604) au format SVG
//  Audio d'une sourate : {folder_url}{NNN}.mp3
// ---------------------------------------------------------------------------

const BASE = 'https://www.mp3quran.net/api/v3';
const PAGES = 'https://www.mp3quran.net/api/quran_pages_svg';

export const TOTAL_PAGES = 604;
export const TOTAL_SURAHS = 114;
export const TOTAL_AYAT = 6236;

/** Code langue de l'interface -> code langue attendu par l'API */
export const LANG_API = { ar: 'ar', fr: 'fr', en: 'eng' };

export const pad3 = (n) => String(n).padStart(3, '0');

export const API = {
  suwar: (lang) => `${BASE}/suwar?language=${lang}`,
  reads: () => `${BASE}/ayat_timing/reads`,
  timing: (surah, read) => `${BASE}/ayat_timing?surah=${surah}&read=${read}`,
  radios: (lang) => `${BASE}/radios?language=${lang}`,
  page: (n) => `${PAGES}/${pad3(n)}.svg`,
};

export const surahAudioUrl = (folderUrl, surahId) => `${folderUrl}${pad3(surahId)}.mp3`;

/** Les pages 1 et 2 (Al-Fatiha / début d'Al-Baqara) sont carrées, les autres 345x550. */
export const pageViewBox = (n) => (n <= 2 ? [235, 235] : [345, 550]);

/** Numéro de page extrait d'une URL ".../quran_pages_svg/012.svg" */
export const pageFromUrl = (url) => {
  const m = url && url.match(/(\d{3})\.svg$/);
  return m ? Number(m[1]) : null;
};

/** Juz (partie) d'une page dans le mushaf de Médine (604 pages). */
export const juzOfPage = (page) => (page < 22 ? 1 : Math.min(30, Math.floor((page - 2) / 20) + 1));

export async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Chaînes officielles (Autorité saoudienne de l'audiovisuel).
// `video` = ID du direct en cours (vérifié le 04/11/2026). Les ID de live changent quand
// la chaîne relance une diffusion (ceux du projet d'origine avaient expiré). Pour le mettre
// à jour : ouvrir https://www.youtube.com/@<handle>/live et copier l'ID après "v=".
// L'intégration "live_stream?channel=" n'est plus acceptée par YouTube.
// Le bouton "Ouvrir sur YouTube" pointe vers la page /live de la chaîne, toujours à jour.
export const YT_CHANNELS = [
  { id: 'quran', video: 'eC4LfEVxvKg', channel: 'UCos52azQNBgW63_9uDJoPDA', handle: 'SaudiQuranTv', place: 'makkah' },
  { id: 'sunna', video: 'Rs7St51oDDc', channel: 'UCROKYPep-UuODNwyipe6JMw', handle: 'SaudiSunnahTv', place: 'madinah' },
];

export const ytEmbed = (videoId) => `https://www.youtube.com/embed/${videoId}?rel=0`;
export const ytLivePage = (handle) => `https://www.youtube.com/@${handle}/live`;
