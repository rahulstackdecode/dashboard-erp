// Logo-Icon.jsx
import Link from "next/link";
import Image from "next/image";

export default function LogoIcon({ className }) {
  return (
    <div className={`logo-wrapper flex items-center ${className || ""}`}>
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="Icon Logo"
          width={30}
          height={30}
          priority
        />
      </Link>
    </div>
  );
}
