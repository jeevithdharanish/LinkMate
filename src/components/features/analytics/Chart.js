'use client';

import { useState } from 'react';
import { addDays, differenceInDays, format, formatISO9075, parseISO } from 'date-fns';
import { useTheme } from '@/components/features/theme/ThemeProvider';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const seriesColors = {
  views: '#0ea5e9',  // sky-500
  clicks: '#8b5cf6', // violet-500
};

const ranges = ['weekly', 'monthly', 'yearly'];

// formatISO9075 returns "YYYY-MM-DD HH:MM:SS" — keep only the date part
function dateOnly(isoDateTime) {
  return isoDateTime.split(' ')[0];
}

export default function Chart({ data }) {
  const [range, setRange] = useState('monthly');
  const { resolvedTheme } = useTheme();

  // Check if data exists and is not empty
  if (!data || data.length === 0) {
    return <div className="text-zinc-500 dark:text-zinc-400">No data available</div>; // Handle empty or undefined data
  }

  const seriesKeys = Object.keys(data[0]).filter((key) => key !== 'date');

  const emptyPoint = Object.fromEntries(seriesKeys.map((key) => [key, 0]));

  // Fill date gaps with zero-value days so quiet days show as zeros, not missing data
  const dataWithoutGaps = [];
  data.forEach((value, index) => {
    const date = value.date;
    const point = { date };
    seriesKeys.forEach((key) => {
      point[key] = value?.[key] || 0;
    });
    dataWithoutGaps.push(point);

    // If the next data point is more than one day away, insert the missing days as zeros
    const nextDate = data?.[index + 1]?.date;
    if (date && nextDate) {
      const daysBetween = differenceInDays(parseISO(nextDate), parseISO(date));
      for (let i = 1; i < daysBetween; i++) {
        dataWithoutGaps.push({
          date: dateOnly(formatISO9075(addDays(parseISO(date), i))),
          ...emptyPoint,
        });
      }
    }
  });

  // Pad with zero-days up to today so recent quiet days show as drops, not missing data
  const lastDate = dataWithoutGaps[dataWithoutGaps.length - 1].date;
  const today = dateOnly(formatISO9075(new Date()));
  const daysToToday = differenceInDays(parseISO(today), parseISO(lastDate));
  for (let i = 1; i <= daysToToday; i++) {
    dataWithoutGaps.push({
      date: dateOnly(formatISO9075(addDays(parseISO(lastDate), i))),
      ...emptyPoint,
    });
  }

  let chartData;
  if (range === 'weekly') {
    chartData = dataWithoutGaps.slice(-7);
  } else if (range === 'monthly') {
    chartData = dataWithoutGaps.slice(-30);
  } else {
    // yearly: bucket days into months, keep the last 12
    const byMonth = new Map();
    dataWithoutGaps.forEach((point) => {
      const monthKey = point.date.slice(0, 7); // "YYYY-MM-DD" -> "YYYY-MM"
      const bucket = byMonth.get(monthKey) || { ...emptyPoint };
      seriesKeys.forEach((key) => {
        bucket[key] += point[key];
      });
      byMonth.set(monthKey, bucket);
    });
    chartData = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, values]) => ({ date: `${month}-01`, ...values }));
  }

  const labelFormat = range === 'yearly' ? 'MMM yyyy' : 'MMM d';
  const formatLabel = (date) => format(parseISO(date), labelFormat);

  // Theme-aware Recharts styling
  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#334155' : '#f5f5f5';
  const tickColor = isDark ? '#94a3b8' : '#aaa';
  const cursorColor = isDark ? '#1e293b' : '#f5f5f5';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '12px',
    color: isDark ? '#f1f5f9' : '#0f172a',
  };

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
              range === r
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart width={730} height={250} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid vertical={false} strokeWidth="2" stroke={gridColor} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: tickColor }} tickFormatter={formatLabel} />
          <YAxis axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: tickColor }} allowDecimals={false} />
          <Tooltip labelFormatter={formatLabel} cursor={{ fill: cursorColor }} contentStyle={tooltipStyle} />
          {seriesKeys.length > 1 && <Legend wrapperStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }} />}
          {seriesKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={seriesColors[key] || '#0ea5e9'}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
