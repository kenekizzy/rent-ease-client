"use client";

import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";

interface NavBarProps {
  title: string;
  subtitle: string;
}

const NavBar = ({ title, subtitle }: NavBarProps) => {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 fixed top-0 right-0 left-56 z-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
            3
          </span>
        </Link>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-xs">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">John Doe</p>
            <p className="text-xs text-gray-400">Landlord</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  )
}

export default NavBar