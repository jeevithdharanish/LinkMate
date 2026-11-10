'use client';

import { useState, useCallback } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot, faList, faGlobe, faCity, faMagnifyingGlassPlus, faMagnifyingGlassMinus, faExpand, faXmark, faLocationDot } from "@fortawesome/free-solid-svg-icons";

// Local TopoJSON path
const geoUrl = "/world-110m.json";

// Mapping ISO 2-letter codes to Numeric ISO codes used in TopoJSON
const ISO_2_TO_NUMERIC = {
  US: '840', CA: '124', MX: '484', BR: '076', AR: '032', CL: '152', CO: '170', PE: '604',
  GB: '826', DE: '276', FR: '250', ES: '724', IT: '380', NL: '528', SE: '752', NO: '578',
  FI: '246', PL: '616', UA: '804', RU: '643', CH: '756', AT: '040', BE: '056', PT: '620',
  IN: '356', CN: '156', JP: '392', KR: '410', SG: '702', MY: '458', ID: '360', TH: '764',
  VN: '704', PH: '608', PK: '586', BD: '050', LK: '144', AE: '784', SA: '682', IL: '376',
  AU: '036', NZ: '554', ZA: '710', EG: '818', NG: '566', KE: '404', MA: '504',
};

const ISO_NUMERIC_TO_2 = Object.fromEntries(
  Object.entries(ISO_2_TO_NUMERIC).map(([k, v]) => [v, k])
);

// Helper to convert country code to flag emoji
function getCountryFlag(code) {
  if (!code || code.length !== 2 || code === 'UNKNOWN') return '🌐';
  try {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

export default function TopLocationsMap({ geoData = { countryStats: [], cityStats: [] } }) {
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [scope, setScope] = useState('country');   // 'country' | 'city'
  const [metric, setMetric] = useState('views');   // 'views' | 'clicks' | 'ctr'
  const [tooltip, setTooltip] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null); // { code, name }
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 10]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.5, 8));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.5, 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setCenter([0, 10]);
    setSelectedCountry(null);
  }, []);

  const handleMoveEnd = useCallback((position) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  }, []);

  const countryStats = geoData.countryStats || [];
  const cityStats = geoData.cityStats || [];

  const items = scope === 'country' ? countryStats : cityStats;
  const maxVal = Math.max(...items.map(i => i[metric] || 0), 1);

  // Map country code/stats lookup
  const statsByCode = new Map();
  countryStats.forEach(c => {
    statsByCode.set(c.code, c);
    const numId = ISO_2_TO_NUMERIC[c.code];
    if (numId) statsByCode.set(numId, c);
  });

  // Calculate fill color based on metric volume
  const getFillColor = (val) => {
    if (!val || val === 0) return '#18181b'; // zinc-900 unvisited
    if (val >= 1000) return '#059669'; // emerald-600
    if (val >= 100) return '#10b981';  // emerald-500
    if (val >= 10) return '#34d399';   // emerald-400
    return '#6ee7b7';                 // emerald-300 soft
  };

  // Get cities for a given country code
  const getCitiesForCountry = useCallback((countryCode) => {
    return cityStats.filter(c => c.code === countryCode);
  }, [cityStats]);

  // Handle clicking a country on the map
  const handleCountryClick = useCallback((countryCode, countryName, topSource) => {
    const cities = getCitiesForCountry(countryCode);
    if (cities.length > 0) {
      setSelectedCountry({ code: countryCode, name: countryName, cities, topSource });
    } else {
      setSelectedCountry({ code: countryCode, name: countryName, cities: [], topSource });
    }
  }, [getCitiesForCountry]);

  const getMetricLabel = (item) => {
    if (metric === 'ctr') return `${item.ctr || 0}% CTR`;
    if (metric === 'clicks') return `${item.clicks || 0} clicks`;
    return `${item.views || 0} views`;
  };

  return (
    <div className="glass glass-hover rounded-2xl p-6 transition-all duration-300">
      {/* Top Header & Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/60 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FontAwesomeIcon icon={faMapLocationDot} className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Top Locations
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Interactive geographic breakdown of audience traffic
            </p>
          </div>
        </div>

        {/* View Mode & Scope Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Map vs List Toggle */}
          <div className="p-1 bg-gray-100 dark:bg-[#121215] border border-gray-200/60 dark:border-zinc-800 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-zinc-700/80'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faGlobe} className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-zinc-700/80'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faList} className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-zinc-800 hidden sm:block"></div>

          {/* Country vs City Toggle */}
          <div className="p-1 bg-gray-100 dark:bg-[#121215] border border-gray-200/60 dark:border-zinc-800 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setScope('country')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                scope === 'country'
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-zinc-700/80'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-white'
              }`}
            >
              Country
            </button>
            <button
              onClick={() => setScope('city')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                scope === 'city'
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-zinc-700/80'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faCity} className="w-3 h-3" />
              <span>City</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body: Real World Map or List */}
      {viewMode === 'map' ? (
        <div className="relative bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 sm:p-6 overflow-hidden">
          {/* Tooltip Overlay */}
          {tooltip && (
            <div className="absolute top-4 left-4 z-30 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs pointer-events-none">
              <span className="text-2xl">{getCountryFlag(tooltip.code)}</span>
              <div>
                <p className="font-bold text-white text-sm">{tooltip.name}</p>
                <p className="text-emerald-400 font-semibold mt-0.5">{getMetricLabel(tooltip)}</p>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-300 hover:text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
              title="Zoom In"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-300 hover:text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Zoom Out"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-300 hover:text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
              title="Reset View"
            >
              <FontAwesomeIcon icon={faExpand} className="w-3.5 h-3.5" />
            </button>
            {zoom > 1 && (
              <div className="text-center text-[10px] font-bold text-emerald-400 mt-0.5">
                {zoom.toFixed(1)}x
              </div>
            )}
          </div>

          {/* Real Interactive SVG World Map Container */}
          <div className="w-full h-72 sm:h-96 relative flex items-center justify-center">
            <ComposableMap
              projection="geoEqualEarth"
              projectionConfig={{ scale: 155 }}
              className="w-full h-full"
            >
              <ZoomableGroup center={center} zoom={zoom} minZoom={1} maxZoom={8} onMoveEnd={handleMoveEnd}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const geoId = geo.id; // e.g. "356", "840"
                      const geoName = geo.properties.name || 'Country';
                      const twoLetterCode = ISO_NUMERIC_TO_2[geoId] || '';
                      const stat = statsByCode.get(geoId) || (twoLetterCode ? statsByCode.get(twoLetterCode) : null);
                      const val = stat ? stat[metric] : 0;
                      const fillColor = getFillColor(val);

                      const isSelected = selectedCountry?.code === twoLetterCode;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => {
                            if (twoLetterCode) {
                              handleCountryClick(twoLetterCode, geoName, stat?.topSource);
                            }
                          }}
                          onMouseEnter={() => {
                            setTooltip({
                              code: twoLetterCode || 'UNKNOWN',
                              name: geoName,
                              views: stat?.views || 0,
                              clicks: stat?.clicks || 0,
                              ctr: stat?.ctr || 0,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          // react-simple-maps v5 dropped style={{ default, hover, pressed }}.
                          // Default/selected colours are SVG presentation attributes so the
                          // hover/focus rules for .tlm-country in globals.css can override them.
                          className="tlm-country"
                          fill={isSelected ? '#059669' : fillColor}
                          stroke={isSelected ? '#34d399' : '#27272a'}
                          strokeWidth={isSelected ? 1.5 : 0.5}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* City Drill-Down Overlay */}
          {selectedCountry && (
            <div
              className="absolute bottom-4 left-4 z-30 w-72 max-h-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden"
              style={{ animation: 'slideUp 300ms ease-out' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCountryFlag(selectedCountry.code)}</span>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{selectedCountry.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-zinc-400 font-medium">{selectedCountry.cities.length} {selectedCountry.cities.length === 1 ? 'city' : 'cities'}</p>
                      {selectedCountry.topSource && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                          <p className="text-[10px] text-emerald-400 font-medium">Top: {selectedCountry.topSource}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* City List */}
              <div className="overflow-y-auto max-h-44 p-2 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}>
                {selectedCountry.cities.length > 0 ? (
                  selectedCountry.cities
                    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
                    .map((city) => {
                      const cityMaxVal = Math.max(...selectedCountry.cities.map(c => c[metric] || 0), 1);
                      const cityVal = city[metric] || 0;
                      const barWidth = Math.max((cityVal / cityMaxVal) * 100, 8);
                      return (
                        <div
                          key={city.locationName}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 transition-all group"
                        >
                          <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-emerald-500/70 group-hover:text-emerald-400 transition-colors" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-200 truncate">{city.city || 'Unknown'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400">{cityVal}</span>
                            <p className="text-[9px] text-zinc-500 leading-tight">
                              {city.views}v · {city.clicks}c
                            </p>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-6 text-zinc-500">
                    <FontAwesomeIcon icon={faLocationDot} className="text-2xl mb-2 opacity-40" />
                    <p className="text-xs">No city-level data yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map Bottom Legend & Metric Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-zinc-800/80">
            {/* Metric Switcher (Bottom Left) */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setMetric('views')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  metric === 'views'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Views
              </button>
              <button
                onClick={() => setMetric('clicks')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  metric === 'clicks'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Clicks
              </button>
              <button
                onClick={() => setMetric('ctr')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  metric === 'ctr'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                CTR
              </button>
            </div>

            {/* Legend (Bottom Center) */}
            <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6ee7b7]"></span> 1+
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></span> 10+
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> 100+
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span> 1,000+
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-3 min-h-[260px]">
          {items.length > 0 ? (
            items.map((item) => {
              const name = scope === 'country' ? item.countryName : item.locationName;
              const flag = getCountryFlag(item.code);
              const val = item[metric] || 0;

              return (
                <div
                  key={name}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-[#141417] border border-gray-200/50 dark:border-zinc-800/80 hover:border-emerald-500/30 transition-all"
                >
                  <span className="text-xl">{flag}</span>
                  <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-zinc-200 truncate">{name}</span>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400 font-medium">{item.views} views · {item.clicks} clicks</span>
                    <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {metric === 'ctr' ? `${item.ctr}%` : val}
                    </span>
                    <div className="w-24 sm:w-32 bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${Math.max((val / maxVal) * 100, 5)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-zinc-500">
              <FontAwesomeIcon icon={faGlobe} className="text-4xl mb-3 opacity-40 text-emerald-400" />
              <p className="text-sm font-medium">No location data recorded yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
