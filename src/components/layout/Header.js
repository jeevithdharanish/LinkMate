
'use client';
import LogoutButton from "@/components/ui/LogoutButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-transparent backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-5xl flex justify-between items-center mx-auto px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
            <FontAwesomeIcon icon={faLink} className="text-white text-sm" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            LinkMate
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <ThemeToggle />
          {!!session && (
            <>
              <Link
                href="/account"
                className="text-sm text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-200 font-medium">
                Hello, {session?.user?.name || session?.user?.email || 'Guest'}
              </Link>
              <LogoutButton
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200"
                iconLeft
                iconClasses="w-3.5 h-3.5"
              />
            </>
          )}
          {!session && (
            <Link
              href="/main/login"
              className="text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}