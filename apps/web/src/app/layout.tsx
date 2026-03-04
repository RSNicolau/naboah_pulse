import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandProvider } from '@/components/providers/BrandProvider';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "Naboah Pulse",
    description: "Omnichannel Command Center for Enterprise",
    manifest: "/manifest.json",
    themeColor: "#070A10",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Naboah Pulse",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`dark ${inter.variable}`}>
            <body className="bg-bg-0 text-text-1 antialiased overflow-hidden flex font-sans">
                <BrandProvider tenantConfig={null}>
                    <SupabaseProvider>
                        <AppShell>
                            {children}
                        </AppShell>
                    </SupabaseProvider>
                </BrandProvider>
            </body>
        </html>
    );
}
