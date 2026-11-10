'use client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faFire } from "@fortawesome/free-solid-svg-icons";
import { SCALE_COLORS, EMPTY_COLOR } from "./volumeScale";

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ActivityHeatmap({ heatmapData = [] }) {
  // Aggregate into a Day x Hour matrix
  const matrix = Array(7).fill(0).map(() => Array(24).fill(0));
  
  // Find max for color scaling
  let maxCount = 0;
  heatmapData.forEach(d => {
    const dayIdx = d.dayOfWeek - 1; // MongoDB $dayOfWeek is 1-7 (Sun-Sat)
    const hr = d.hourOfDay; // 0-23
    
    // Safety check just in case
    if (dayIdx >= 0 && dayIdx < 7 && hr >= 0 && hr < 24) {
      matrix[dayIdx][hr] += d.count;
      if (matrix[dayIdx][hr] > maxCount) maxCount = matrix[dayIdx][hr];
    }
  });

  // Same ordered scale as the Top Locations map, bucketed by share of the busiest hour.
  const getCellColor = (count) => {
    if (count === 0) return EMPTY_COLOR;
    const ratio = count / maxCount;
    if (ratio >= 0.8) return SCALE_COLORS[3];
    if (ratio >= 0.5) return SCALE_COLORS[2];
    if (ratio >= 0.2) return SCALE_COLORS[1];
    return SCALE_COLORS[0];
  };

  const formatHour = (h) => {
    if (h === 0) return '12A';
    if (h === 12) return '12P';
    return h > 12 ? `${h - 12}P` : `${h}A`;
  };

  return (
    <div className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDays} className="text-zinc-400" />
              Activity Heatmap
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-1">When are visitors most active?</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300">
            <FontAwesomeIcon icon={faFire} className="text-indigo-500" />
            IST Time
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto custom-scrollbar pb-2 pt-10 -mt-10">
          <div className="min-w-[600px]">
            {/* Header row (Hours) */}
            <div className="flex mb-1">
              <div className="w-10 flex-shrink-0"></div>
              <div className="flex-1 flex">
                {HOURS.map(h => (
                  <div key={`h-${h}`} className="flex-1 text-center text-[10px] font-bold text-zinc-500">
                    {h % 2 === 0 ? formatHour(h) : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix rows (Days) */}
            <div className="space-y-1.5">
              {DAYS.map((day, dIdx) => (
                <div key={day} className="flex items-center">
                  <div className="w-10 flex-shrink-0 text-xs font-bold text-zinc-400 pr-2 text-right">
                    {day}
                  </div>
                  <div className="flex-1 flex gap-1">
                    {HOURS.map(h => {
                      const count = matrix[dIdx][h];
                      return (
                        <div
                          key={`${day}-${h}`}
                          className={`flex-1 aspect-square rounded-[4px] border transition-all duration-300 hover:scale-125 hover:z-10 relative group/cell cursor-crosshair border-zinc-800/80`}
                          style={{ backgroundColor: getCellColor(count) }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2.5 py-1.5 bg-zinc-800 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover/cell:opacity-100 group-hover/cell:visible transition-all shadow-xl border border-zinc-700 z-50 pointer-events-none">
                            {count} views
                            <span className="block text-indigo-400 font-medium text-[9px] mt-0.5">{day} at {formatHour(h)}</span>
                            {/* triangle pointer */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-end gap-2 text-[10px] font-bold text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[EMPTY_COLOR, ...SCALE_COLORS].map((color) => (
              <div key={color} className="w-3 h-3 rounded-[3px] border border-zinc-800/80" style={{ backgroundColor: color }}></div>
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
