/**
 * Global state สำหรับ layer visibility / opacity
 * ใช้ React context + useReducer (ไม่ต้องติดตั้ง library เพิ่ม)
 */
'use client';

import { createContext, useContext, useReducer, type Dispatch } from 'react';
import { LAYER_CONFIGS } from '@/config/layers';
import type { LayerId, LayerConfig } from '@/types/layers';

// ── State ──────────────────────────────────────────────────────────────────
export interface LayerState {
  layers: LayerConfig[];
  selectedLayerId: LayerId | null;
}

const initialState: LayerState = {
  layers: LAYER_CONFIGS,
  selectedLayerId: null,
};

// ── Actions ────────────────────────────────────────────────────────────────
type Action =
  | { type: 'TOGGLE_VISIBILITY'; id: LayerId }
  | { type: 'SET_OPACITY'; id: LayerId; opacity: number }
  | { type: 'SELECT_LAYER'; id: LayerId | null };

function reducer(state: LayerState, action: Action): LayerState {
  switch (action.type) {
    case 'TOGGLE_VISIBILITY':
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.id ? { ...l, visible: !l.visible } : l
        ),
      };
    case 'SET_OPACITY':
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.id ? { ...l, opacity: action.opacity } : l
        ),
      };
    case 'SELECT_LAYER':
      return { ...state, selectedLayerId: action.id };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
export const LayerContext = createContext<{
  state: LayerState;
  dispatch: Dispatch<Action>;
} | null>(null);

export { reducer, initialState };
export type { Action };

export function useLayerStore() {
  const ctx = useContext(LayerContext);
  if (!ctx) throw new Error('useLayerStore must be inside LayerProvider');
  return ctx;
}
