import { createSlice } from '@reduxjs/toolkit';
import { load } from '../storage';

const prefersLight = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches;
  } catch {
    return false;
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: load('theme', prefersLight() ? 'light' : 'dark'),
    lang: load('lang', 'ar'),
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setLang: (state, action) => {
      state.lang = action.payload;
    },
  },
});

export const { toggleTheme, setLang } = uiSlice.actions;
export default uiSlice.reducer;
