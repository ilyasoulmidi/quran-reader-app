import { createSlice } from '@reduxjs/toolkit';
import { load } from '../storage';

// Lecteur audio global : un seul <audio> pour toute l'application,
// la lecture continue quand on change de page.
const playerSlice = createSlice({
  name: 'player',
  initialState: {
    // { kind: 'surah', id, readId, url, startAt, nonce } | { kind: 'radio', id, url, title, nonce }
    track: null,
    isPlaying: false,
    buffering: false,
    error: false,
    currentTime: 0,
    duration: 0,
    volume: load('volume', 0.8),
    muted: false,
    rate: 1,
    repeat: load('repeat', 'next'), // 'off' | 'one' | 'next'
    seek: null, // { time, nonce }
    lastSurah: load('lastSurah', null),
  },
  reducers: {
    playTrack: (state, action) => {
      // autoplay: false -> la piste est chargée mais attend que l'utilisateur appuie sur lecture
      const autoplay = action.payload.autoplay !== false;
      state.track = { ...action.payload, autoplay, nonce: Date.now() + Math.random() };
      state.isPlaying = autoplay;
      state.buffering = autoplay;
      state.error = false;
      state.currentTime = action.payload.startAt || 0;
      state.duration = 0;
      if (action.payload.kind === 'surah') state.lastSurah = action.payload.id;
    },
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    togglePlay: (state) => {
      if (state.track) state.isPlaying = !state.isPlaying;
    },
    setBuffering: (state, action) => {
      state.buffering = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      if (action.payload) {
        state.isPlaying = false;
        state.buffering = false;
      }
    },
    setTime: (state, action) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = Math.min(1, Math.max(0, action.payload));
      state.muted = state.volume === 0;
    },
    toggleMute: (state) => {
      state.muted = !state.muted;
    },
    setRate: (state, action) => {
      state.rate = action.payload;
    },
    cycleRepeat: (state) => {
      const order = ['next', 'one', 'off'];
      state.repeat = order[(order.indexOf(state.repeat) + 1) % order.length];
    },
    requestSeek: (state, action) => {
      state.seek = { time: action.payload, nonce: Date.now() + Math.random() };
      state.currentTime = action.payload;
    },
    stop: (state) => {
      state.track = null;
      state.isPlaying = false;
      state.currentTime = 0;
      state.duration = 0;
    },
  },
});

export const {
  playTrack, setPlaying, togglePlay, setBuffering, setError, setTime, setDuration,
  setVolume, toggleMute, setRate, cycleRepeat, requestSeek, stop,
} = playerSlice.actions;
export default playerSlice.reducer;
