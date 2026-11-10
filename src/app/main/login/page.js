
'use client';
import { use } from "react";
import LoginWithGoogle from "@/components/ui/LoginWithGoogle";

export default function LoginPage(props) {
  const searchParams = use(props.searchParams);
  const desiredUsername = searchParams?.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />

      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="text-white text-xl">🔗</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to LinkMate
          </h1>
          {desiredUsername ? (
            <div className="mb-4 mt-4">
              <p className="text-slate-300 text-sm mb-3">
                You&apos;re claiming the username:
              </p>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <span className="text-indigo-300 font-mono font-semibold text-sm">
                  linkto/{desiredUsername}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Sign in to create your link page
            </p>
          )}
        </div>
        <div className="space-y-4">
          <LoginWithGoogle />
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">
          By signing in, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}