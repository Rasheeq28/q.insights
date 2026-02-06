import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google"; // Using a nice font

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Q.Labs - Premium Dataset Discovery",
  description: "Discover and export high-quality structured datasets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-slate-50 min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        {/* Add padding top to account for fixed navbar */}
        <div className="flex-grow pt-16">
          {children}
        </div>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Q.Labs Platform. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
