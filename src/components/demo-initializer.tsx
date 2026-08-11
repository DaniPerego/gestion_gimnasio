'use client';

import { useEffect } from 'react';
import { seedDemoData } from '@/lib/seed-demo';

export function DemoInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedDemoData();
  }, []);

  return <>{children}</>;
}
