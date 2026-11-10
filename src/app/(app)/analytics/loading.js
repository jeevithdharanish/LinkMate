export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">

      {/* ── Header Skeleton ── */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-6 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-4 w-28 bg-white/20 rounded mb-3" />
            <div className="h-8 w-56 bg-white/20 rounded mb-2" />
            <div className="h-4 w-44 bg-white/10 rounded" />
          </div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/10 w-24">
                <div className="h-7 w-12 bg-white/20 rounded mx-auto mb-1" />
                <div className="h-3 w-16 bg-white/10 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          'emerald', 'blue', 'purple', 'rose', 'amber'
        ].map((color, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
              <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-700 rounded mb-2" />
            <div className="h-3 w-14 bg-zinc-100 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* ── Chart Skeleton ── */}
      <div className="glass rounded-2xl p-6">
        <div className="h-6 w-52 bg-zinc-200 dark:bg-zinc-700 rounded mb-6" />
        {/* Fake bar chart */}
        <div className="flex items-end gap-2 h-48">
          {[40, 65, 30, 80, 55, 70, 45, 90, 60, 35, 75, 50].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t"
                style={{ height: `${h}%` }}
              />
              <div className="h-2.5 w-6 bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Audience Breakdown Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['Traffic Sources', 'Top Locations', 'Devices'].map((title, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
              <div>
                <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-700 rounded mb-1" />
                <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[70, 50, 30, 20].map((w, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded" style={{ width: `${w}%` }} />
                  <div className="h-4 w-8 bg-zinc-200 dark:bg-zinc-700 rounded ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Activity Feed Skeleton ── */}
      <div className="glass rounded-2xl p-6">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/40/50 dark:bg-zinc-850/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-64 bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Links Performance Skeleton ── */}
      <div className="glass rounded-2xl p-6">
        <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-700 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/40/50 dark:bg-zinc-850/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center min-w-0 flex-1">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg mr-3" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-3 w-56 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4 md:ml-4">
                <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Socials Performance Skeleton ── */}
      <div className="glass rounded-2xl p-6">
        <div className="h-6 w-44 bg-zinc-200 dark:bg-zinc-700 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Projects Performance Skeleton ── */}
      <div className="glass rounded-2xl p-6">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-700 rounded mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(j => (
                  <div key={j} className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    </div>
                    <div className="h-7 w-10 bg-zinc-200 dark:bg-zinc-700 rounded mb-1" />
                    <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
