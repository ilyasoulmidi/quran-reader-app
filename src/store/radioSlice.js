import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API, getJSON, LANG_API } from '../api';
import { load } from '../storage';

// Radios placées en fin de liste (flux souvent instable)
const MOVE_TO_END = [1];

export const fetchRadios = createAsyncThunk('radio/fetchRadios', async (lang) => {
  const data = await getJSON(API.radios(LANG_API[lang]));
  const list = data.radios.map((r) => ({ id: r.id, name: r.name.trim(), url: r.url }));
  return [...list.filter((r) => !MOVE_TO_END.includes(r.id)), ...list.filter((r) => MOVE_TO_END.includes(r.id))];
});

const radioSlice = createSlice({
  name: 'radio',
  initialState: {
    radios: [],
    status: 'idle',
    favorites: load('favRadios', []),
    broken: [], // radios qui n'ont pas pu être lues pendant cette session
  },
  reducers: {
    markBroken: (state, action) => {
      if (!state.broken.includes(action.payload)) state.broken.push(action.payload);
    },
    unmarkBroken: (state, action) => {
      state.broken = state.broken.filter((x) => x !== action.payload);
    },
    toggleFavRadio: (state, action) => {
      const id = action.payload;
      state.favorites = state.favorites.includes(id)
        ? state.favorites.filter((x) => x !== id)
        : [...state.favorites, id];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRadios.pending, (state) => {
        state.status = state.radios.length ? 'succeeded' : 'loading';
      })
      .addCase(fetchRadios.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.radios = action.payload;
      })
      .addCase(fetchRadios.rejected, (state) => {
        if (!state.radios.length) state.status = 'failed';
      });
  },
});

export const { toggleFavRadio, markBroken, unmarkBroken } = radioSlice.actions;
export default radioSlice.reducer;
