import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API, getJSON, LANG_API } from '../api';
import { load } from '../storage';

export const fetchRadios = createAsyncThunk('radio/fetchRadios', async (lang) => {
  const data = await getJSON(API.radios(LANG_API[lang]));
  return data.radios.map((r) => ({ id: r.id, name: r.name.trim(), url: r.url }));
});

const radioSlice = createSlice({
  name: 'radio',
  initialState: {
    radios: [],
    status: 'idle',
    favorites: load('favRadios', []),
  },
  reducers: {
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

export const { toggleFavRadio } = radioSlice.actions;
export default radioSlice.reducer;
