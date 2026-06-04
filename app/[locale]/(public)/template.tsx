'use client';

import { useEffect } from 'react';

type PublicTemplateProps = {
  children: React.ReactNode;
};

export default function PublicTemplate({ children }: PublicTemplateProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return children;
}
