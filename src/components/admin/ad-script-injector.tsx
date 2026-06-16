'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface ActiveScript {
  id: string;
  scriptCode: string;
  position: string;
}

export function AdScriptInjector() {
  const [scripts, setScripts] = useState<ActiveScript[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchActiveScripts() {
      try {
        const res = await fetch('/api/admin/ad-scripts?active=true');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setScripts(
            data.map((s: { id: string; scriptCode: string; position: string }) => ({
              id: s.id,
              scriptCode: s.scriptCode,
              position: s.position || 'body-end',
            })),
          );
        }
      } catch {
        // Silently fail - ad scripts are non-critical
      }
    }
    fetchActiveScripts();
  }, [pathname]);

  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((script) => (
        <AdScriptBlock key={script.id} script={script} />
      ))}
    </>
  );
}

function AdScriptBlock({ script }: { script: ActiveScript }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  // Use dangerouslySetInnerHTML for ad script injection
  // This is intentional and controlled by admin only
  return (
    <div
      data-ad-script-id={script.id}
      data-ad-position={script.position}
      dangerouslySetInnerHTML={{ __html: script.scriptCode }}
      suppressHydrationWarning
    />
  );
}