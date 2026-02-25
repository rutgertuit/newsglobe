import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digital War Room | Eye of Providence',
  description: 'Global surveillance, threat tracking, and market correlation dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden m-0 p-0 bg-black">
        {children}
      </body>
    </html>
  );
}
