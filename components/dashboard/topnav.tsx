"use client";
import Link from "next/link";
import Image from "next/image"
import { UserButton } from "../auth/user-button";
import { MobileMenu } from "../auth/mobile-menu";

export const TopNav = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="flex h-16 items-center px-4 md:px-8">
        <Link
          href="/dashboard"
          className="flex items-center text-lg font-semibold"
        >
          <Image src="/logo-text.png" alt="logo-image" width={120} height={0} className="w-auto h-auto" style={{ width: "auto", height: "auto" }} priority />
        </Link>
        <div className="ml-auto flex items-center space-x-6 md:space-x-4">
          <UserButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
