"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useUser();
  return (
    <nav className="w-full h-full p-2 bg-[#202020] flex flex-col">
      <div className="flex items-center mt-1 mb-2">
        <UserButton />
        {user && (
          <span className="text-neutral-200 font-semibold text-sm pl-2">
            {user.fullName}
          </span>
        )}
      </div>
      <NavItem href="/" text="Home" />
      <NavItem href="/receipts" text="Receipts" />
      <NavItem href="/upload" text="Upload" />
    </nav>
  );
}

function NavItem({ href, text }: { href: string; text: string }) {
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      className={`text-neutral-500 mt-1 px-2 py-2 rounded text-sm ${
        active ? "bg-[#2c2c2c] text-neutral-200" : "hover:bg-[#2c2c2c]"
      }`}
    >
      {text}
    </Link>
  );
}
