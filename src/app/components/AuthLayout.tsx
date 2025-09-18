import React from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen relative bg-white">
            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center z-10">
                {children}
            </main>
            <div className="absolute bottom-0 w-full h-[520px] overflow-hidden">
                <Image
                    src="/images/bg-image.svg"
                    alt="Shape Bg"
                    fill
                    priority
                    className="object-cover"
                />
            </div>
            {/* Footer */}
            <footer className="w-full border-t py-4.5 text-center text-sm text-black border-[#0000000D] z-10">
                © {new Date().getFullYear()} Stackdecode, All Rights Reserved |{" "}
                <a href="/privacy" className="hover:underline" style={{ color: "var(--primary-color)" }}>
                    Privacy Policy
                </a>
            </footer>
        </div>
    );
}
