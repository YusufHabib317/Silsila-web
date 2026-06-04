'use client';

import Link from 'next/link';

import classes from './global-error.module.css';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className={classes.body}>
        <main className={classes.root}>
          <h1>Something went wrong</h1>
          <p>{error.message || 'An unexpected error happened.'}</p>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button type="button" onClick={() => reset()}>
              Try again
            </button>
            <Link href="/">Go home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
