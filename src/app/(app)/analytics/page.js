import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Chart from "@/components/features/analytics/Chart";
import AudienceTabs from "@/components/features/analytics/AudienceTabs";
import TopLocationsMap from "@/components/features/analytics/TopLocationsMap";
import StatCard from "@/components/features/analytics/StatCard";
import WeekTotalStats from "@/components/features/analytics/WeekTotalStats";
import { getAnalytics } from "@/lib/analytics";
import { buttonsIcons, buttonLink } from "@/lib/socialButtons";
import { Page } from "@/models/Page";
import {
  faEye, faLink, faPercent, faExternalLinkAlt, faProjectDiagram,
  faGlobe, faLocationDot, faDesktop, faArrowRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import ActivityHeatmap from "@/components/features/analytics/ActivityHeatmap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  await mongoose.connect(process.env.MONGO_URI);
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect('/');
  }

  const page = await Page.findOne({ owner: session.user.email }).lean();
  if (!page) {
    return redirect('/claim-username');
  }

  const analytics = await getAnalytics(page.uri, session.user.email);

  const summaryCards = [
    { label: 'Total Views', value: analytics.totalViews.toLocaleString(), today: `${analytics.todayViews} today`, icon: faEye, trend: analytics.viewTrend },
    { label: 'Link Clicks', value: analytics.totalLinkClicks.toLocaleString(), today: `${analytics.todayLinkClicks} today`, icon: faLink, trend: analytics.linkTrend },
    { label: 'Social Clicks', value: analytics.totalSocialClicks.toLocaleString(), today: `${analytics.todaySocialClicks} today`, icon: faExternalLinkAlt, trend: analytics.socialTrend },
    { label: 'Project Clicks', value: analytics.totalProjectClicks.toLocaleString(), today: `${analytics.todayProjectClicks} today`, icon: faProjectDiagram, trend: analytics.projectTrend },
    { label: 'Click Rate', value: `${analytics.clickRate}%`, today: `${analytics.todayClickRate}% today`, icon: faPercent, note: 'link clicks / views' },
    { label: 'Bounce Rate', value: `${analytics.bounceRate}%`, today: `zero clicks`, icon: faArrowRightFromBracket, note: 'no engagement' },
  ];

  const totalClicks = analytics.totalLinkClicks + analytics.totalSocialClicks + analytics.totalProjectClicks;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header — pinned on scroll, same as AccountHeader on My Page */}
      <div className="md:sticky md:top-0 md:z-50 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-6 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <a
                href="/account"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Editor
              </a>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-indigo-100 mt-1">Track your portfolio performance</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/10">
              <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              <p className="text-xs text-indigo-200/70">Total Views</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/10">
              <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-indigo-200/70">Total Clicks</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/10">
              <p className="text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</p>
              <p className="text-xs text-indigo-200/70">Unique Visitors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {summaryCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Chart */}
      <div className="glass glass-hover rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Views & Clicks Over Time</h2>
        <Chart data={analytics.chartData} />
      </div>

      {/* Heatmap */}
      <div className="pt-2">
        <ActivityHeatmap heatmapData={analytics.heatmapData} />
      </div>

      {/* Audience & Activity: Traffic Sources, Top Locations, Devices, Recent Activity in one tabbed section */}
      <AudienceTabs
        trafficSources={analytics.trafficSources}
        topLocations={analytics.topLocations}
        devices={analytics.devices}
        totalSourceViews={analytics.totalSourceViews}
        uniqueVisitors={analytics.uniqueVisitors}
        returningVisitors={analytics.returningVisitors}
        recentSessions={analytics.recentSessions}
      />

      {/* Top Locations Interactive World Map & Country/City Breakdown */}
      <TopLocationsMap geoData={analytics.geoData} />

      {/* Links Performance: all links ranked by clicks, deleted links at the bottom */}
      <div className="glass glass-hover rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Links Performance</h2>
        {analytics.linksPerformance.length > 0 ? (
          <div className="space-y-4">
            {analytics.linksPerformance.map((link, index) => {
              const progress = analytics.totalLinkClicks > 0 ? (link.totalClicks / analytics.totalLinkClicks) * 100 : 0;
              return (
                <div key={`${link.url}-${index}`} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-200">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-950/40 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">#{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium truncate ${link.isDeleted ? 'text-red-600' : 'text-zinc-900 dark:text-white'}`}>
                        {link.title}
                        {link.isDeleted && (
                          <span className="ml-2 px-2 py-0.5 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-full text-xs font-medium align-middle">
                            deleted
                          </span>
                        )}
                        {link.topSource && (
                          <span className="ml-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-full text-[10px] font-bold align-middle uppercase tracking-wider">
                            Source: {link.topSource}
                          </span>
                        )}
                      </p>
                      {link.isDeleted ? (
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 truncate">{link.url}</p>
                      ) : (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 truncate block"
                        >
                          {link.url}
                          <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 text-xs" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:ml-4">
                    <WeekTotalStats week={link.weekClicks} total={link.totalClicks} color="indigo" />
                    <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${link.isDeleted ? 'bg-red-400' : 'bg-indigo-500 dark:bg-indigo-600'}`}
                        style={{ width: `${Math.max(progress, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <FontAwesomeIcon icon={faLink} className="text-4xl mb-4 text-zinc-300 dark:text-zinc-600" />
            <p>No links added yet</p>
            <p className="text-sm mt-2">Add some links to see their performance</p>
          </div>
        )}
      </div>

      {/* Socials Performance */}
      <div className="glass glass-hover rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Socials Performance</h2>
        {Object.keys(page.buttons || {}).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(page.buttons).map(([key, value]) => {
              if (!value) return null;
              const realUrl = buttonLink(key, value);
              const Icon = buttonsIcons[key];

              return (
                <div key={key} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-200">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      {Icon && <div className="flex-shrink-0 w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center"><FontAwesomeIcon icon={Icon} className="w-5 h-5 text-zinc-600 dark:text-zinc-400" /></div>}
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white capitalize">{key}</h3>
                        <p className="text-sm text-indigo-500 dark:text-indigo-400 truncate">{value}</p>
                      </div>
                    </div>
                    <WeekTotalStats
                      week={analytics.socialClickMaps.week.get(realUrl) || 0}
                      total={analytics.socialClickMaps.total.get(realUrl) || 0}
                      color="blue"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-4xl mb-4 text-zinc-300 dark:text-zinc-600" />
            <p>No social buttons added yet</p>
          </div>
        )}
      </div>

      {/* Projects Performance */}
      <div className="glass glass-hover rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Projects Performance</h2>
        {analytics.projects.length > 0 ? (
          <div className="space-y-4">
            {analytics.projects.map((project) => (
              <div key={project._id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-200">
                <h3 className="font-medium text-zinc-900 dark:text-white truncate mb-3">
                  {project.title || 'Untitled Project'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GitHub Link Stats */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 mb-2">
                      <FontAwesomeIcon icon={faGithub} className="w-4 h-4" />
                      <span className="text-sm font-medium">GitHub</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">{analytics.projectClickMaps.total.get(project.githubLink) || 0}</span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">clicks</span>
                    </div>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{analytics.projectClickMaps.week.get(project.githubLink) || 0} this week</span>
                  </div>
                  {/* Live Demo Link Stats */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 mb-2">
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4" />
                      <span className="text-sm font-medium">Live Demo</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">{analytics.projectClickMaps.total.get(project.liveLink) || 0}</span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">clicks</span>
                    </div>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{analytics.projectClickMaps.week.get(project.liveLink) || 0} this week</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <FontAwesomeIcon icon={faProjectDiagram} className="text-4xl mb-4 text-zinc-300 dark:text-zinc-600" />
            <p>No projects added yet</p>
          </div>
        )}
      </div>

    </div>
  );
}
