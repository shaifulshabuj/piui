import React, { createContext, useContext, useReducer } from 'react';
import type { Screen, Overlay } from '../types';

interface NavState {
  screen: Screen;
  overlay: Overlay;
}

type NavAction =
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'OPEN_OVERLAY'; overlay: Overlay }
  | { type: 'CLOSE_OVERLAY' };

interface NavContextValue extends NavState {
  navigate: (screen: Screen) => void;
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen, overlay: null };
    case 'OPEN_OVERLAY':
      return { ...state, overlay: action.overlay };
    case 'CLOSE_OVERLAY':
      return { ...state, overlay: null };
    default:
      return state;
  }
}

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(navReducer, {
    screen: 'chat',
    overlay: null,
  });

  const navigate = (screen: Screen) => dispatch({ type: 'NAVIGATE', screen });
  const openOverlay = (overlay: Overlay) => dispatch({ type: 'OPEN_OVERLAY', overlay });
  const closeOverlay = () => dispatch({ type: 'CLOSE_OVERLAY' });

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOverlay();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        navigate('model');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <NavContext.Provider value={{ ...state, navigate, openOverlay, closeOverlay }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
