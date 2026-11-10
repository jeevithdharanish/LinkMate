
'use client';
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";

export default function LoginWithGoogle() {
  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/account',
        redirect: true
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Error signing in with Google. Please check the console for details.');
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full bg-white dark:bg-[#141417] border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-200 font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-500/60 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
      <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 text-red-500" />
      <span>Continue with Google</span>
    </button>
  );
}