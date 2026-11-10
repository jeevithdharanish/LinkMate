'use client';
import { use } from "react";
import Link from "next/link";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ParticleNetwork from "@/components/animations/ParticleNetwork";
import LoginWithGoogle from "@/components/ui/LoginWithGoogle";

export default function LoginPage(props) {
  const searchParams = use(props.searchParams);
  const desiredUsername = searchParams?.username;

  return (
    <main>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute inset-0 -z-10">
          <ParticleNetwork className="opacity-40 dark:opacity-60" />
        </div>

        <div className="glass rounded-2xl w-full max-w-sm p-8 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-md">
              <FontAwesomeIcon icon={faLink} className="text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                LinkMate
              </span>
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              {desiredUsername
                ? 'Sign in to claim your username'
                : 'Sign in to create your link page'}
            </p>
            {desiredUsername && (
              <div className="mt-5 inline-flex items-center rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 font-mono text-sm">
                <span className="text-gray-400 dark:text-slate-500">linkmate/</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-300">{desiredUsername}</span>
              </div>
            )}
          </div>

          <LoginWithGoogle />

          <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-6">
            By signing in, you agree to our{' '}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
