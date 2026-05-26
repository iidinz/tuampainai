'use client';

import { useReducer } from 'react';
import { LayerContext, reducer, initialState } from '@/store/layerStore';

export default function LayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <LayerContext.Provider value={{ state, dispatch }}>
      {children}
    </LayerContext.Provider>
  );
}
