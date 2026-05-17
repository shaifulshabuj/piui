import React, { createContext, useContext, useReducer } from 'react';
import type { Screen, Overlay } from '../types';

interface NavState {
  screen: Screen;
  overlay: Overlay;
  inspectToolId: string | null;
  params: Record<string, string>;
}

type NavAction =
  | { type: 'NAVIGATE'; screen: Screen; params?: Record<string, string> }
  | { type: 'OPEN_OVERLAY'; overlay: Overlay }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'INSPECT'; toolId: string };

interface NavContextValue extends NavState {
  navigate: (screen: Screen, params?: Record<string, string>) => void;
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
  inspect: (toolId: string) => void;
}

const NavContext = createContext<NavContextValue | null>(null);

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen, overlay: null, params: action.params ?? {} };
    case 'OPEN_OVERLAY':
      return { ...state, overlay: action.overlay };
    case 'CLOSE_OVERLAY':
      return { ...state, overlay: null };
    case 'INSPECT':
      return { ...state, screen: 'inspect', overlay: null, inspectToolId: action.toolId };
    default:
      return state;
  }
}

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(navReducer, {
    screen: 'chat',
    overlay: null,
    inspectToolId: null,
    params: {},
  });

  const navigate = (screen: Screen, params?: Record<string, string>) =>
    dispatch({ type: 'NAVIGATE', screen, params });
  const openOverlay = (overlay: Overlay) => dispatch({ type: 'OPEN_OVERLAY', overlay });
  const closeOverlay = () => dispatch({ type: 'CLOSE_OVERLAY' });
  const inspect = (toolId: string) => dispatch({ type: 'INSPECT', toolId });

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
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        openOverlay('command-palette');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NavContext.Provider value={{ ...state, navigate, openOverlay, closeOverlay, inspect }}>
      {children}
    </NavContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
