import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MainLayout from '@/components/layout/main-layout';

// Load Inter font
const inter = Inter({ subsets: ['latin'] });

// SEO Metadata
export const metadata: Metadata = {
  title: 'HAVANAH | Premium Real Estate & Vehicle Rentals',
  description: 'The premier marketplace for luxury apartments, homes, and premium vehicles in The Gambia.',
  icons: {
    icon: '/logo.jpg', // Make sure you have this image in public/ folder
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* MainLayout handles Auth Protection, Navbar vs Sidebar logic, and Toast Provider */}
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}