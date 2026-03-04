import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandProvider } from '@/components/providers/BrandProvider';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Naboah Pulse | Jarvis ChannelHub",
    description: "Omnichannel Command Center for Enterprise",
    manifest: "/manifest.json",
    themeColor: "#0066FF",
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
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-[#05060A] text-[#E6EAF2] antialiased overflow-hidden flex`}>
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
