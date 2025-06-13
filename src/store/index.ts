import { configureStore } from '@reduxjs/toolkit';
import incidentReducer from './incidentSlice';

export const store = configureStore({
  reducer: {
    incidents: incidentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;