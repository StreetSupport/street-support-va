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
      <body className="antialiased">{children}</body>
    </html>
  );
}
