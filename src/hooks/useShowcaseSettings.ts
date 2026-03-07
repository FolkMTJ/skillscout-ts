// src/hooks/useShowcaseSettings.ts
'use client';

import { useEffect, useState } from 'react';

export interface ShowcaseSettings {
  showcaseMode: boolean;
  showcaseName: string;
}

export function useShowcaseSettings() {
  const [settings, setSettings] = useState<ShowcaseSettings>({
    showcaseMode: false,
    showcaseName: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setSettings({
          showcaseMode: data.showcaseMode ?? false,
          showcaseName: data.showcaseName ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
