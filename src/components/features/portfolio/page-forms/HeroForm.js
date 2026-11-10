'use client';

import { useRouter } from "next/navigation";

export default function HeroForm({ user }) {
  const router = useRouter();

  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    const input = form.querySelector('input');
    const username = input.value;
    if (username.length > 0) {
      if (user) {
        router.push('/account?desiredUsername=' + encodeURIComponent(username));
      } else {
        window.localStorage.setItem('desiredUsername', username);
        router.push(`/main/login?username=${encodeURIComponent(username)}`);
      }
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="inline-flex items-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-gray-200/50 dark:border-slate-800/50 shadow-elevated rounded-2xl overflow-hidden max-w-md mx-auto w-full"
      >
        <span className="bg-transparent py-4 pl-5 text-gray-400 dark:text-slate-500 font-medium text-sm"><label htmlFor="hero-username" className="sr-only">Username</label>linkmate/</span>
        <input
          id="hero-username"
          type="text"
          className="outline-none flex-1 text-gray-900 dark:text-white font-medium bg-transparent"
          style={{ backgroundColor: 'transparent', marginBottom: 0, paddingLeft: 0, border: 'none', boxShadow: 'none' }}
          placeholder="yourname"
          aria-label="Choose your username"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 px-6 whitespace-nowrap hover:shadow-lg transition-all duration-200 font-semibold text-sm"
        >
          Claim Username
        </button>
      </form>

    </div>
  );
}