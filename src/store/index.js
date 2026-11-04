import { configureStore } from '@reduxjs/toolkit';
import quran from './quranSlice';
import radio from './radioSlice';
import player from './playerSlice';
import ui from './uiSlice';
import { save } from '../storage';

export const store = configureStore({
  reducer: { quran, radio, player, ui },
});

// Sauvegarde des préférences (uniquement quand elles changent).
let prev = {};
store.subscribe(() => {
  const s = store.getState();
  const next = {
    readId: s.quran.readId,
    page: s.quran.page,
    nightPage: s.quran.nightPage,
    favSurahs: s.quran.favorites,
    favRadios: s.radio.favorites,
    volume: s.player.volume,
    repeat: s.player.repeat,
    lastSurah: s.player.lastSurah,
    theme: s.ui.theme,
    lang: s.ui.lang,
  };
  Object.keys(next).forEach((k) => {
    if (next[k] !== prev[k]) save(k, next[k]);
  });
  prev = next;
});
