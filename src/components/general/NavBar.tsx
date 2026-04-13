"use client";

import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NavBarProps {
  title: string;
  subtitle: string;
}

const NavBar = ({ title, subtitle }: NavBarProps) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  console.log("User Data", user)

  const handleLogout = () => {
    try {
      // 1. Clear all cookies
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }

      // 2. Clear auth store and local storage via the store's logout
      logout();

      // 3. Redirect to login
      router.push("/login");
      toast.success("Successfully logged out");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 fixed top-0 right-0 left-56 z-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-gray-100 pr-6">
          <Link href="/notifications" className="relative group">
            <div className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors text-gray-500 hover:text-indigo-600">
              <Bell className="w-5 h-5" />
            </div>
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              3
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{user?.firstName + " " + user?.lastName}</p>
              <p className="text-xs text-gray-400 mt-1">{user?.role}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
