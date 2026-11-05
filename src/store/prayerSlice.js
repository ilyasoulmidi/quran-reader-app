import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJSON } from '../api';
import { load } from '../storage';
import { DEFAULT_LOCATION } from '../data/countries';
import { addDays, ddmmyyyy, offsetNow, parseOffset, tzNow } from '../time';

// API Aladhan (gratuite, sans clé) : https://aladhan.com/prayer-times-api
const BASE = 'https://api.aladhan.com/v1';
export const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function dayUrl(loc, date) {
  const d = ddmmyyyy(date);
  const q = new URLSearchParams({ iso8601: 'true' }); // heures avec décalage UTC : "2026-11-05T17:40:00+00:00"
  if (loc.type === 'coords') {
    q.set('latitude', loc.lat);
    q.set('longitude', loc.lng);
    if (loc.method != null) q.set('method', loc.method); // sinon : méthode choisie automatiquement par l'API
    return `${BASE}/timings/${d}?${q}`;
  }
  q.set('city', loc.city);
  q.set('country', loc.extra?.country || loc.country);
  if (loc.extra?.state) q.set('state', loc.extra.state);
  q.set('method', loc.method);
  return `${BASE}/timingsByCity/${d}?${q}`;
}

function pick(res) {
  const { timings, date, meta } = res.data;
  return {
    date: date.gregorian.date, // "05-11-2026"
    timings: Object.fromEntries(PRAYERS.map((p) => [p, timings[p].slice(11, 16)])),
    offset: parseOffset(timings.Fajr),
    hijri: { day: Number(date.hijri.day), month: date.hijri.month.number, year: date.hijri.year },
    tz: meta.timezone,
    method: { id: meta.method?.id, name: meta.method?.name },
  };
}

/** Horaires d'aujourd'hui et de demain (pour le Fajr de demain après l'Isha). */
export const fetchPrayer = createAsyncThunk('prayer/fetch', async (_, { getState }) => {
  const { location, tz, offset } = getState().prayer;
  const today = offset != null ? offsetNow(offset) : tzNow(tz);
  const [a, b] = await Promise.all([
    getJSON(dayUrl(location, today)),
    getJSON(dayUrl(location, addDays(today, 1))),
  ]);
  if (a.code !== 200 || b.code !== 200) throw new Error('API');
  return { today: pick(a), tomorrow: pick(b) };
});

const prayerSlice = createSlice({
  name: 'prayer',
  initialState: {
    location: load('prayerLocation', DEFAULT_LOCATION),
    tz: load('prayerTz', null),
    offset: load('prayerOffset', null), // décalage UTC de la ville (minutes)
    status: 'idle',
    today: null,
    tomorrow: null,
  },
  reducers: {
    setLocation: (state, action) => {
      state.location = action.payload;
      state.tz = null;
      state.offset = null;
      state.today = null;
      state.tomorrow = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrayer.pending, (state) => {
        state.status = state.today ? 'refreshing' : 'loading';
      })
      .addCase(fetchPrayer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.today = action.payload.today;
        state.tomorrow = action.payload.tomorrow;
        state.tz = action.payload.today.tz;
        state.offset = action.payload.today.offset;
      })
      .addCase(fetchPrayer.rejected, (state) => {
        state.status = state.today ? 'succeeded' : 'failed';
      });
  },
});

export const { setLocation } = prayerSlice.actions;
export default prayerSlice.reducer;
