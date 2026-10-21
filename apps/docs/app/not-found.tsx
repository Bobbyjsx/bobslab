import * as React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist in the Bobslab UI documentation.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
      >
        Return to Overview
      </Link>
    </div>
  );
}
