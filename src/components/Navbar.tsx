"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="w-full p-4 bg-white shadow-md flex justify-center space-x-6">
      <NavItem href="/" text="Home" active={pathname === "/"} />
      <NavItem
        href="/receipts"
        text="Receipts"
        active={pathname === "/receipts"}
      />
      <NavItem href="/upload" text="Upload" active={pathname === "/upload"} />
    </nav>
  );
}

function NavItem({
  href,
  text,
  active,
}: {
  href: string;
  text: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium ${
        active ? "bg-gray-200" : "hover:bg-gray-100"
      }`}
    >
      {text}
    </Link>
  );
}
