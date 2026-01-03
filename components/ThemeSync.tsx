'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Componente interno que faz a sincronização
 */
function ThemeSyncInner() {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (user?.theme_preference) {
      setTheme(user.theme_preference);
    } else if (!user) {
      setTheme('light');
    }
  }, [user, setTheme]);

  return null;
}

/**
 * Wrapper que garante renderização apenas no cliente
 */
export function ThemeSync() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return <ThemeSyncInner />;
}
