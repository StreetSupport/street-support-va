import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Street Support Network - Virtual Assistant',
  description: 'Find homelessness and housing support services in your area',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* So the quick exit is fast: connect to BBC Weather and fetch the page early. */}
        <link rel="preconnect" href="https://www.bbc.co.uk" />
        <link rel="prefetch" href="https://www.bbc.co.uk/weather" referrerPolicy="no-referrer" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
