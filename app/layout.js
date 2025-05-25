// app/layout.js
import AuthProvider from "./provider";
import Navbar from "@/components/Navbar";

import "./globals.css";

export const metadata = {
  title: "Matrimonial App",
  description: "A matrimonial platform to connect people",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
