import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../providers/theme-provider";
import { CryptoProvider } from "../contexts/crypto-context";
import "./globals.css";

export const metadata = {
  title: "Lexcade",
  description: "Professional cryptocurrency trading platform",
};

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CryptoProvider>
            {children}
          </CryptoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
