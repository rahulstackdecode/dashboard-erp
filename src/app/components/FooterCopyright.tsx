import React from "react";

export default function FooterCopyright() {
    return (
          <footer className="w-full border-t py-4.5 px-3 text-center text-sm text-black border-[#0000000D] bg-white z-10 mt-3" >
               <p> © {new Date().getFullYear()} Stackdecode, All Rights Reserved |{" "}
                <a href="/privacy" className="hover:underline" style={{ color: "var(--primary-color)" }}>
                    Privacy Policy
                </a></p>
            </footer>
    );
}
