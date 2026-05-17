import { useEffect } from 'react';
import './index.css';
import { NavProvider, useNav } from './context/NavContext';
import type { Screen, Overlay } from './types';
import { setupEventHandler } from './lib/eventHandler';
import { MainChat } from './screens/MainChat';
import { Onboarding } from './screens/Onboarding';
import { SessionTree } from './screens/SessionTree';
import { ModelPicker } from './screens/ModelPicker';
import { Packages } from './screens/Packages';
import { ExtensionDetail } from './screens/ExtensionDetail';
import { PromptTemplates } from './screens/PromptTemplates';
import { ContextEditor } from './screens/ContextEditor';
import { ThemeCustomizer } from './screens/ThemeCustomizer';
import { ShareExport } from './screens/ShareExport';
import { ToolInspector } from './screens/ToolInspector';
import { Steering } from './screens/Steering';
import { FeatureStatus } from './screens/FeatureStatus';
import { Settings } from './screens/Settings';
import { Help } from './screens/Help';
import { CommandPalette } from './screens/CommandPalette';
import { PermissionPrompt } from './screens/PermissionPrompt';

function AppRouter() {
  const { screen, overlay, navigate, openOverlay } = useNav();

  useEffect(() => {
    // Wire pi event stream to stores (idempotent, returns cleanup)
    const cleanupEvents = setupEventHandler();

    // Handle navigation commands sent from the Electron app menu
    const cleanupNav = window.pi?.onNavigate((s) => navigate(s as Screen));
    const cleanupOverlay = window.pi?.onOverlay((o) => openOverlay(o as Overlay));

    // Auto-show permission overlay when pi requests permission
    const onPermission = () => openOverlay('permission-prompt');
    window.addEventListener('pi:permission-request', onPermission);

    return () => {
      cleanupEvents?.();
      cleanupNav?.();
      cleanupOverlay?.();
      window.removeEventListener('pi:permission-request', onPermission);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const screens: Record<string, React.ReactNode> = {
    chat: <MainChat />,
    onboarding: <Onboarding />,
    tree: <SessionTree />,
    model: <ModelPicker />,
    packages: <Packages />,
    'ext-detail': <ExtensionDetail />,
    prompts: <PromptTemplates />,
    context: <ContextEditor />,
    theme: <ThemeCustomizer />,
    share: <ShareExport />,
    inspect: <ToolInspector />,
    steering: <Steering />,
    features: <FeatureStatus />,
    settings: <Settings />,
    help: <Help />,
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {screens[screen] ?? <MainChat />}
      {overlay === 'command-palette' && <CommandPalette />}
      {overlay === 'permission-prompt' && <PermissionPrompt />}
    </div>
  );
}

export default function App() {
  return (
    <NavProvider>
      <AppRouter />
    </NavProvider>
  );
}
