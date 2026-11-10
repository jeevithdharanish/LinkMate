'use client';

import { useTheme } from "@/components/features/theme/ThemeProvider";
import SectionBox from "@/components/layout/SectionBox";
import FormHeader from "@/components/ui/FormHeader";
import { faArrowLeft, faChevronRight, faCircleCheck, faGear, faMoon, faPalette, faRightFromBracket, faSun, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "next-auth/react";
import Link from "next/link";

const themes = [
  { id: 'light', label: 'Light', icon: faSun, preview: 'bg-zinc-50 border-zinc-200', bar: 'bg-zinc-300' },
  { id: 'dark', label: 'Dark', icon: faMoon, preview: 'bg-zinc-950 border-zinc-800', bar: 'bg-zinc-700' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faGear} className="text-zinc-400 text-xl" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
      </div>

      {/* Appearance */}
      <SectionBox>
        <FormHeader title="Appearance" description="Choose how your dashboard looks" icon={faPalette} />
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-4">
          {themes.map((t) => {
            const selected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(t.id)}
                className={`relative text-left rounded-xl border-2 p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${selected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
              >
                {/* Mini preview of the theme */}
                <div className={`h-20 rounded-lg border ${t.preview} p-2.5 flex gap-2 mb-3`}>
                  <div className={`w-1/4 rounded ${t.bar}`} />
                  <div className="flex-1 space-y-1.5">
                    <div className={`h-2 w-3/4 rounded ${t.bar}`} />
                    <div className={`h-2 w-1/2 rounded ${t.bar}`} />
                    <div className="h-2 w-1/3 rounded bg-indigo-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  <FontAwesomeIcon icon={t.icon} className="w-3.5 h-3.5 text-indigo-500" />
                  {t.label}
                  {selected && <FontAwesomeIcon icon={faCircleCheck} className="ml-auto text-indigo-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </SectionBox>

      {/* Account */}
      <SectionBox>
        <FormHeader title="Account" description="Leave the dashboard or sign out" icon={faUser} />
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 -mx-2">
          <Link
            href="/main"
            className="flex items-center gap-3 px-2 py-3.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-zinc-400" />
            <span>Back to website</span>
            <FontAwesomeIcon icon={faChevronRight} className="ml-auto w-3 h-3 text-zinc-400" />
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/main' })}
            className="flex items-center gap-3 w-full px-2 py-3.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </SectionBox>
    </div>
  );
}
