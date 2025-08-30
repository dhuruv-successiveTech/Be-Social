"use client";
import { Inter } from "next/font/google";
import { ApolloProvider } from "@apollo/client/react";
import apolloClient from "../apollo/client";
import { AuthProvider } from "../hooks/useAuth";
import { ThemeProvider } from "../context/ThemeContext";
import NotificationDisplay from "../components/notification/NotificationDisplay";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen transition-all duration-200`}>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <ThemeProvider>
              <div className="min-h-screen transition-all duration-200 bg-[#FFFAF5] dark:bg-gray-900">
                {children}
                <NotificationDisplay />
                <Toaster 
                  toastOptions={{
                    style: {
                      background: '#FFFAF5',
                      color: '#1F2937',
                    },
                    dark: {
                      style: {
                        background: '#374151',
                        color: '#F3F4F6',
                      },
                    },
                  }} 
                />
              </div>
            </ThemeProvider>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
           
}
