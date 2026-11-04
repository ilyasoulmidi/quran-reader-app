import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API, getJSON, LANG_API, TOTAL_PAGES, pageFromUrl } from '../api';
import { load } from '../storage';

/** Liste des 114 sourates : nom arabe + nom traduit dans la langue de l'interface. */
export const fetchSuwar = createAsyncThunk('quran/fetchSuwar', async (lang) => {
  const requests = [getJSON(API.suwar('ar'))];
  if (lang !== 'ar') requests.push(getJSON(API.suwar(LANG_API[lang])));
  const [ar, tr] = await Promise.all(requests);
  return ar.suwar.map((s) => ({
    id: s.id,
    name: s.name.trim(),
    nameTr: tr ? (tr.suwar.find((x) => x.id === s.id)?.name || '').trim() : '',
    start_page: s.start_page,
    end_page: s.end_page,
    makkia: s.makkia,
  }));
});

/** Récitateurs disposant du minutage des versets (comme dans le projet d'origine). */
export const fetchReads = createAsyncThunk('quran/fetchReads', () => getJSON(API.reads()), {
  condition: (_, { getState }) => !['loading', 'succeeded'].includes(getState().quran.readsStatus),
});

/** Minutage + polygones des versets d'une sourate pour un récitateur. */
export const fetchTiming = createAsyncThunk(
  'quran/fetchTiming',
  async ({ surah, read }) => {
    const data = await getJSON(API.timing(surah, read));
    return data.map((t) => ({
      ayah: t.ayah,
      start: t.start_time,
      end: t.end_time,
      page: pageFromUrl(t.page),
      points: t.polygon,
    }));
  },
  {
    condition: ({ surah, read }, { getState }) => {
      const entry = getState().quran.timings[`${surah}-${read}`];
      return !entry || entry.status === 'failed';
    },
  }
);

const clampPage = (n) => Math.min(TOTAL_PAGES, Math.max(1, Number(n) || 1));

const quranSlice = createSlice({
  name: 'quran',
  initialState: {
    suwar: [],
    suwarStatus: 'idle',
    reads: [],
    readsStatus: 'idle',
    readId: load('readId', 1),
    page: load('page', 1),
    follow: true,
    nightPage: load('nightPage', false),
    favorites: load('favSurahs', []),
    timings: {}, // { "surah-read": { status, data } }
  },
  reducers: {
    setPage: (state, action) => {
      state.page = clampPage(action.payload);
    },
    setRead: (state, action) => {
      state.readId = Number(action.payload);
    },
    setFollow: (state, action) => {
      state.follow = action.payload;
    },
    toggleNightPage: (state) => {
      state.nightPage = !state.nightPage;
    },
    toggleFavSurah: (state, action) => {
      const id = action.payload;
      state.favorites = state.favorites.includes(id)
        ? state.favorites.filter((x) => x !== id)
        : [...state.favorites, id];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuwar.pending, (state) => {
        state.suwarStatus = state.suwar.length ? 'succeeded' : 'loading';
      })
      .addCase(fetchSuwar.fulfilled, (state, action) => {
        state.suwarStatus = 'succeeded';
        state.suwar = action.payload;
      })
      .addCase(fetchSuwar.rejected, (state) => {
        if (!state.suwar.length) state.suwarStatus = 'failed';
      })
      .addCase(fetchReads.pending, (state) => {
        state.readsStatus = 'loading';
      })
      .addCase(fetchReads.fulfilled, (state, action) => {
        state.readsStatus = 'succeeded';
        state.reads = action.payload;
        if (!action.payload.some((r) => r.id === state.readId) && action.payload[0]) {
          state.readId = action.payload[0].id;
        }
      })
      .addCase(fetchReads.rejected, (state) => {
        state.readsStatus = 'failed';
      })
      .addCase(fetchTiming.pending, (state, action) => {
        const { surah, read } = action.meta.arg;
        state.timings[`${surah}-${read}`] = { status: 'loading', data: [] };
      })
      .addCase(fetchTiming.fulfilled, (state, action) => {
        const { surah, read } = action.meta.arg;
        state.timings[`${surah}-${read}`] = { status: 'succeeded', data: action.payload };
      })
      .addCase(fetchTiming.rejected, (state, action) => {
        const { surah, read } = action.meta.arg;
        state.timings[`${surah}-${read}`] = { status: 'failed', data: [] };
      });
  },
});

export const { setPage, setRead, setFollow, toggleNightPage, toggleFavSurah } = quranSlice.actions;
export default quranSlice.reducer;
