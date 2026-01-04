import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/designSystem.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SnapBite",
  description: "Social Food Ordering",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
