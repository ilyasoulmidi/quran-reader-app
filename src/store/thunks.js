import { surahAudioUrl, TOTAL_SURAHS } from '../api';
import { fetchReads, fetchTiming, setFollow, setPage } from './quranSlice';
import { playTrack } from './playerSlice';

/** Verset en cours de récitation (ou null). */
export function selectActiveAyah(state) {
  const { track, currentTime } = state.player;
  if (!track || track.kind !== 'surah') return null;
  const entry = state.quran.timings[`${track.id}-${track.readId}`];
  if (!entry || !entry.data.length) return null;
  const ms = currentTime * 1000;
  return entry.data.find((t) => ms >= t.start && ms < t.end) || null;
}

/**
 * Lance une sourate avec le récitateur choisi.
 * @param {{surahId:number, ayah?:number, movePage?:boolean, autoplay?:boolean}} opts
 * autoplay=false : la sourate est chargée, le son démarre quand on appuie sur lecture.
 */
export const playSurah = ({ surahId, ayah, movePage = true, autoplay = true }) => async (dispatch, getState) => {
  if (getState().quran.readsStatus !== 'succeeded') await dispatch(fetchReads());
  const { quran } = getState();
  const read = quran.reads.find((r) => r.id === quran.readId) || quran.reads[0];
  if (!read) return;

  const key = `${surahId}-${read.id}`;
  let startAt = 0;
  if (ayah) {
    await dispatch(fetchTiming({ surah: surahId, read: read.id }));
    const t = getState().quran.timings[key]?.data.find((x) => x.ayah === ayah);
    if (t) startAt = t.start / 1000;
  } else {
    dispatch(fetchTiming({ surah: surahId, read: read.id }));
  }

  if (movePage && !ayah) {
    const surah = quran.suwar.find((s) => s.id === surahId);
    if (surah) dispatch(setPage(surah.start_page));
  }
  dispatch(setFollow(true));
  dispatch(
    playTrack({ kind: 'surah', id: surahId, readId: read.id, url: surahAudioUrl(read.folder_url, surahId), startAt, autoplay })
  );
};

export const playRadio = (radio) =>
  playTrack({ kind: 'radio', id: radio.id, url: radio.url, title: radio.name });

/**
 * Piste suivante (+1) ou précédente (-1) : sourate ou radio selon ce qui joue.
 * La lecture continue seulement si elle était déjà en cours (ou si forcePlay).
 */
export const skip = (dir, forcePlay) => (dispatch, getState) => {
  const { track, isPlaying } = getState().player;
  if (!track) return;
  if (track.kind === 'surah') {
    const next = ((track.id - 1 + dir + TOTAL_SURAHS) % TOTAL_SURAHS) + 1;
    dispatch(playSurah({ surahId: next, autoplay: forcePlay ?? isPlaying }));
  } else {
    const { radios } = getState().radio;
    if (!radios.length) return;
    const i = radios.findIndex((r) => r.id === track.id);
    dispatch(playRadio(radios[(i + dir + radios.length) % radios.length]));
  }
};
