import { useEffect } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';

export function useTheme() {
  const theme = useRoadmapStore((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    function apply() {
      const effective =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : theme;
      root.classList.toggle('dark', effective === 'dark');
      root.style.colorScheme = effective;
    }
    apply();
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
  }, [theme]);
}
