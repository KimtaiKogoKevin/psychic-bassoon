import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Or any other font you prefer
import './globals.css'; // Your global styles
import { Header } from '@/components/layout/Header'; // Import your Header
import { Footer } from '@/components/layout/Footer'; // Import your Footer
import { cn } from '@/lib/utils'; // shadcn/ui utility for conditional classes

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' }); // Added variable for Tailwind

export const metadata: Metadata = {
  title: 'B2B Wholesale Portal',
  description: 'Exclusive portal for wholesale customers of Your Company Name.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          "min-h-screen bg-background font-sans antialiased flex flex-col"
        )}
        suppressHydrationWarning={true}
      >
        <Header />
        <main className="flex-grow container mx-auto py-8 px-4 md:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}