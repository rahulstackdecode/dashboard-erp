import Image from "next/image";
import Link from "next/link";

export default function Logo({ className }) {
    return (
        <div className={`logo-wrapper flex items-center ${className}`}>
            <Link href="/">
                <Image
                    src="/stackdecode-logo.svg"
                    alt="Stack Decode Logo"
                    width={150}
                    height={62}
                    priority
                />
            </Link>
        </div>
    );
}
