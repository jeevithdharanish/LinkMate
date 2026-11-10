"use client";

import { faChartLine, faFileLines, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: '/account', icon: faFileLines, label: 'My Page' },
    { href: '/analytics', icon: faChartLine, label: 'Analytics' },
    { href: '/settings', icon: faGear, label: 'Settings' },
];

export default function AppSidebar() {
    const path = usePathname();

    return (
        <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
                const isActive = path.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-sm font-semibold'
                                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                            }`}
                    >
                        {isActive && (
                            <div className="w-1 h-5 bg-gradient-to-b from-indigo-400 to-violet-400 rounded-full" />
                        )}
                        <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
