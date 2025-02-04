// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthWrapper } from "./components/AuthWrapper";
import { BottomNavigation } from "@/components/bottom-navigation";
import { navigationItems } from "@/constants/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VetAI",
  description: "Health app for dogs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthWrapper>
            {children}
            {/* Ensure only one BottomNavigation is rendered */}
            <BottomNavigation items={navigationItems} />
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
