import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './Providers';

export const metadata: Metadata = {
  title: 'سامانه مدیریت زرهاب',
  applicationName: 'سامانه مدیریت زرهاب',
  icons: {
    icon: '/logos/ZarHubFavIcon.png',
    apple: '/logos/ZarHubFavIcon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
