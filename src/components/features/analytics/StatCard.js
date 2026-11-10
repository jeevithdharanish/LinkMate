import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

// All summary cards share the brand accent; green/red are reserved for the trend badge.
const style = {
  hover: 'hover:border-indigo-200 dark:hover:border-indigo-800/40',
  sub: 'text-indigo-600 dark:text-indigo-400',
  iconBg: 'bg-indigo-100 dark:bg-indigo-950/30',
  icon: 'text-indigo-600 dark:text-indigo-400',
};

function TrendBadge({ current, previous }) {
  if (current === 0 && previous === 0) {
    return <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 block">no activity this week</span>;
  }
  const change = previous > 0
    ? Math.round(((current - previous) / previous) * 100)
    : 100;
  const up = change >= 0;
  return (
    <span className={`text-xs mt-1 flex items-center ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      <FontAwesomeIcon icon={up ? faArrowUp : faArrowDown} className="mr-1" />
      {Math.abs(change)}% vs last week
    </span>
  );
}

// Summary card: headline number, "today" sub-line, optional week-over-week
// trend badge or free-text note under it.
export default function StatCard({ label, value, today, icon, trend, note }) {
  return (
    <div className={`glass glass-hover rounded-2xl p-6 ${style.hover}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
          <p className={`text-xs ${style.sub} mt-1 flex items-center`}>
            <FontAwesomeIcon icon={faCalendarDay} className="mr-1" />
            {today}
          </p>
          {trend && <TrendBadge current={trend.current} previous={trend.previous} />}
          {note && <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 block">{note}</span>}
        </div>
        <div className={`p-3 ${style.iconBg} rounded-xl`}>
          <FontAwesomeIcon icon={icon} className={`text-xl ${style.icon}`} />
        </div>
      </div>
    </div>
  );
}
