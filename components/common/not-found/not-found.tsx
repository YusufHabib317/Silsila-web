import Link from 'next/link';

export function NotFoundScreen() {
  return (
    <main
      style={{
        padding: '5rem 1rem',
        minHeight: 'calc(100vh - 8rem)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2.5rem' }}>404</h1>
        <p style={{ margin: 0, color: '#555' }}>We couldn&apos;t find this page.</p>
        <p>
          <Link href="/">Go to Home</Link>
        </p>
      </div>
    </main>
  );
}
