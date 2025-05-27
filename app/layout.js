// app/layout.js
import AuthProvider from "./provider";
import Navbar from "@/components/Navbar";

import "./globals.css";
import FloatingElements from "@/components/floating-elements";

export const metadata = {
  title: "Matrimonial App",
  description: "A matrimonial platform to connect people",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FloatingElements />
          <Navbar />
          <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
