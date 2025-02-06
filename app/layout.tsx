import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthWrapper } from "./components/AuthWrapper";
import { ConditionalBottomNavigation } from "@/components/ConditionalBottomNavigation";

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
            {/* Conditionally render BottomNavigation */}
            <ConditionalBottomNavigation />
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
