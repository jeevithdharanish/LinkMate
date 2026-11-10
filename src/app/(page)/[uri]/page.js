import { Page } from "@/models/Page";
import { User } from "@/models/User";
import { WorkExperience } from "@/models/WorkExperience";
import { Education } from "@/models/Education";
import { Project } from "@/models/Project";
import { Event } from "@/models/Event";
import { connectToDatabase } from "@/lib/mongoClient";
import { getVisitorMeta, isBot, refTagToReferrer } from "@/lib/track";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope, faLink, faLocationDot,
  faArrowUpRightFromSquare, faDownload, faArrowDown,
  faHeart, faChevronUp, faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { buttonsIcons, buttonLink } from "@/lib/socialButtons";
import { clickPingUrl, normalizeBaseUrl } from "@/lib/urlHelpers";
import SummarySection from "@/components/features/portfolio/page-sections/SummarySection";
import SkillsSection from "@/components/features/portfolio/page-sections/SkillsSection";
import WorkExperienceSection from "@/components/features/portfolio/page-sections/WorkExperienceSection";
import EducationSection from "@/components/features/portfolio/page-sections/EducationSection";
import ProjectSection from "@/components/features/portfolio/page-sections/ProjectSection";
import ParticleNetwork from "@/components/animations/ParticleNetwork";
import ScrollReveal from "@/components/animations/ScrollReveal";
import Typewriter from "@/components/animations/Typewriter";

// Cache page data for 60 seconds — key includes uri for per-page isolation
const getCachedPageData = unstable_cache(
  async (uri) => {
    await connectToDatabase();
    return Page.findOne({ uri }).lean();
  },
  ['page-data'],
  { revalidate: 60, tags: ['portfolio'] }
);

// Dynamic SEO metadata - uses cached page data
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const page = await getCachedPageData(resolvedParams.uri);

    if (!page) {
      return {
        title: 'Portfolio Not Found | LinkMate',
        description: 'This portfolio page does not exist.',
      };
    }

    const title = `${page.displayName || 'Portfolio'} | LinkMate`;
    const description = page.bio || page.summary?.slice(0, 160) || `Check out ${page.displayName}'s professional portfolio`;
    const imageUrl = page.profileImage || '/profile.jpg';

    // Absolute base for OG/twitter URLs (relative URLs resolve against this)
    let metadataBase;
    try {
      metadataBase = new URL(process.env.URL);
    } catch { }

    return {
      ...(metadataBase ? { metadataBase } : {}),
      title,
      description,
      keywords: ['portfolio', 'developer', page.displayName, 'resume', 'projects'].filter(Boolean),
      authors: [{ name: page.displayName }],
      openGraph: {
        title,
        description,
        type: 'profile',
        images: [{ url: imageUrl, width: 800, height: 800, alt: page.displayName }],
        url: `/${page.uri}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Portfolio | LinkMate',
      description: 'Professional portfolio page',
    };
  }
}

// Fallback icon when a button key is not in buttonsIcons
const fallbackIcon = faGlobe;

// Social button colors with solid backgrounds
const buttonStyles = {
  email: { bg: "bg-red-500", hover: "hover:bg-red-600" },
  mobile: { bg: "bg-green-500", hover: "hover:bg-green-600" },
  instagram: { bg: "bg-gradient-to-br from-purple-600 to-pink-500", hover: "hover:from-purple-700 hover:to-pink-600" },
  facebook: { bg: "bg-blue-600", hover: "hover:bg-blue-700" },
  linkedin: { bg: "bg-blue-700", hover: "hover:bg-blue-800" },
  youtube: { bg: "bg-red-600", hover: "hover:bg-red-700" },
  github: { bg: "bg-gray-800", hover: "hover:bg-gray-900" },
  geeksforgeeks: { bg: "bg-green-600", hover: "hover:bg-green-700" },
  resume: { bg: "bg-indigo-600", hover: "hover:bg-indigo-700" },
  discord: { bg: "bg-indigo-500", hover: "hover:bg-indigo-600" },
  tiktok: { bg: "bg-black", hover: "hover:bg-gray-900" },
  whatsapp: { bg: "bg-green-500", hover: "hover:bg-green-600" },
  telegram: { bg: "bg-sky-500", hover: "hover:bg-sky-600" },
};

export default async function UserPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const uri = resolvedParams.uri;
  const baseUrl = normalizeBaseUrl(process.env.URL || "");

  try {
    await connectToDatabase();

    // Use cached page data (same cache as generateMetadata)
    const pageData = await getCachedPageData(uri);

    if (!pageData) {
      return notFound();
    }

    // Fetch related data in parallel
    const [userData, workExperience, education, projects] = await Promise.all([
      User.findOne({ email: pageData.owner }).lean(),
      WorkExperience.find({ owner: pageData.owner, pageUri: uri }).lean(),
      Education.find({ owner: pageData.owner, pageUri: uri }).lean(),
      Project.find({ owner: pageData.owner, pageUri: uri }).lean(),
    ]);

    // Serialize data to avoid Mongoose document issues
    const serializedEducation = JSON.parse(JSON.stringify(education));
    const serializedProjects = JSON.parse(JSON.stringify(projects));
    const serializedWorkExperience = JSON.parse(JSON.stringify(workExperience));

    // Track page view - non-blocking (don't await).
    // Skips link-preview bots; the owner's own visits are stored but flagged.
    const visitorMeta = getVisitorMeta(headers());
    // An explicit ?ref= tag beats the Referer header (which many apps strip)
    const refReferrer = refTagToReferrer(resolvedSearchParams?.ref);
    if (refReferrer) visitorMeta.referrer = refReferrer;
    if (!isBot(visitorMeta.userAgent)) {
      const session = await getServerSession(authOptions).catch(() => null);
      const isOwner = session?.user?.email === pageData.owner;
      Event.create({ uri: uri, page: uri, type: 'view', ...visitorMeta, isOwner }).catch(() => { });
    }

    // Build a shallow copy with alphabetically sorted buttons — never mutate cached pageData
    const sortedButtonKeys = Object.keys(pageData.buttons || {}).sort();
    const sortedButtons = {};
    for (const key of sortedButtonKeys) {
      sortedButtons[key] = pageData.buttons[key];
    }
    const page = { ...pageData, buttons: sortedButtons };

    const backgroundStyle =
      page.bgType === "color"
        ? { backgroundColor: page.bgColor }
        : { backgroundImage: `url(${page.bgImage})` };

    // Resume button only shows when the user explicitly set a resume URL
    const resumeLink = page.buttons?.resume || '/RESUME.pdf';
    const hasResume = !!page.buttons?.resume;

    // Structured data so search engines understand this is a person's profile
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: page.displayName || page.uri,
      url: `${baseUrl}${page.uri}`,
      ...(page.bio ? { description: page.bio } : {}),
      ...(page.profileImage ? { image: page.profileImage } : {}),
      ...(page.location ? { address: page.location } : {}),
      sameAs: Object.entries(page.buttons || {})
        .filter(([key, value]) => value && !['email', 'mobile', 'resume'].includes(key))
        .map(([, value]) => value),
    };

    return (
      <div className="bg-black text-white min-h-screen overflow-x-hidden">
        <script
          type="application/ld+json"
          // Escape "<" so user content (bio, button URLs) cannot close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />

        {/* === HERO SECTION - Split Layout === */}
        <section className="relative min-h-screen flex">

          {/* LEFT SIDE - Profile Image (Full Height) */}
          <div className="hidden lg:block lg:w-1/2 xl:w-2/5 relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>

            {/* Profile Image - Full Cover */}
            <div className="absolute inset-0">
              <Image
                className="w-full h-full object-cover object-center"
                src={page.profileImage || '/profile.jpg'}
                alt={`${page.displayName}'s photo`}
                fill
                priority
                sizes="50vw"
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10"></div>
            <div className="absolute top-10 left-10 w-20 h-20 border-l-2 border-t-2 border-blue-500/30 z-20"></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-purple-500/30 z-20"></div>
          </div>

          {/* RIGHT SIDE - Content */}
          <div className="w-full lg:w-1/2 xl:w-3/5 relative flex items-center">
            {/* Animated Background for right side */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-black via-[#09090b] to-black"></div>

              {/* Particle Network Animation */}
              <ParticleNetwork className="opacity-60" />

              {/* Animated gradient orbs */}
              <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 px-8 md:px-12 lg:px-16 xl:px-20 py-20 w-full">

              {/* Mobile Profile Image */}
              <div className="lg:hidden mb-10 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow opacity-75 blur-sm"></div>
                  <div className="relative w-40 h-40 rounded-full border-4 border-slate-950 overflow-hidden">
                    <Image
                      className="w-full h-full object-cover"
                      src={page.profileImage || '/profile.jpg'}
                      alt={`${page.displayName}'s avatar`}
                      width={160}
                      height={160}
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Greeting — badge can be turned off in account settings */}
              {page.showAvailableBadge !== false && (
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Available for opportunities
                  </span>
                </div>
              )}

              {/* Name */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                <span className="text-slate-400 text-2xl md:text-3xl font-normal block mb-2">Hello, I&apos;m</span>
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  {page.displayName}
                </span>
              </h1>

              {/* Bio/Title */}
              {page.bio && (
                <p className="text-lg md:text-xl lg:text-2xl text-slate-400 mb-8 leading-relaxed max-w-xl min-h-[1.75em]">
                  <Typewriter
                    words={(() => {
                      const list = page.bio.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
                      if (list.length === 1 && list[0].toLowerCase() === 'software developer') {
                        return ['software developer', 'mern stack developer', 'problem solver', 'frontend engineer'];
                      }
                      return list;
                    })()}
                    speed={80}
                    delay={2500}
                  />
                </p>
              )}

              {/* Location */}
              {page.location && (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-slate-300 mb-10">
                  <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">{page.location}</span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                {hasResume && (
                  <Link
                    href={resumeLink}
                    target="_blank"
                    download
                    ping={clickPingUrl(baseUrl, page.uri, resumeLink, 'social')}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faDownload} className="w-5 h-5 group-hover:animate-bounce" />
                    Download Resume
                  </Link>
                )}

              </div>

              {/* Social Links */}
              {Object.keys(page.buttons || {}).length > 0 && (
                <div>
                  <p className="text-slate-500 text-sm uppercase tracking-wider mb-4 font-medium">Connect with me</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(page.buttons).map((buttonKey) => {
                      const url = buttonLink(buttonKey, page.buttons[buttonKey]);
                      const pingUrl = clickPingUrl(baseUrl, page.uri, url, 'social');
                      const style = buttonStyles[buttonKey] || { bg: "bg-blue-500", hover: "hover:bg-blue-600" };
                      const icon = buttonsIcons[buttonKey] || fallbackIcon;

                      return (
                        <Link
                          key={buttonKey}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          ping={pingUrl}
                          className={`group relative w-12 h-12 rounded-xl ${style.bg} ${style.hover} text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300`}
                          aria-label={buttonKey}
                        >
                          <FontAwesomeIcon
                            className="w-5 h-5"
                            icon={icon}
                          />
                          <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white text-slate-900 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap capitalize shadow-lg">
                            {buttonKey}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-20">
            <Link href="#about" className="flex flex-col items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <FontAwesomeIcon icon={faArrowDown} className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* === MAIN CONTENT === */}
        <main className="relative">

          {/* About Section */}
          {page.summary && (
            <section id="about" className="py-24 bg-slate-900/50">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <SummarySection summary={page.summary} />
              </div>
            </section>
          )}

          {/* Experience Section */}
          {serializedWorkExperience?.length > 0 && (
            <section id="experience" className="py-24 bg-slate-950">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <WorkExperienceSection workExperience={serializedWorkExperience} />
              </div>
            </section>
          )}

          {/* Projects Section */}
          {serializedProjects?.length > 0 && (
            <section id="projects" className="py-24 bg-slate-900/50">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <ProjectSection
                  projects={serializedProjects}
                  baseUrl={baseUrl}
                  pageUri={page.uri}
                />
              </div>
            </section>
          )}

          {/* Skills Section */}
          {page.skills && Object.keys(page.skills).length > 0 && (
            <section id="skills" className="py-24 bg-slate-950">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <SkillsSection skills={page.skills} />
              </div>
            </section>
          )}

          {/* Education Section */}
          {serializedEducation?.length > 0 && (
            <section id="education" className="py-24 bg-slate-900/50">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <EducationSection education={serializedEducation} />
              </div>
            </section>
          )}

          {/* Featured Links Section */}
          {(page.links || []).length > 0 && (
            <section id="links" className="py-24 bg-slate-950">
              <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <ScrollReveal animation="fade-up">
                  <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-4">
                      <FontAwesomeIcon icon={faLink} className="w-4 h-4" />
                      Resources
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4">
                      Featured Links
                    </h2>
                    <p className="text-slate-400">Check out my profiles and resources</p>
                  </div>
                </ScrollReveal>

                <div className="grid gap-4 md:grid-cols-2">
                  {(page.links || []).map((link, index) => (
                    <ScrollReveal
                      key={`${link.url}-${index}`}
                      animation="fade-up"
                      stagger={100}
                      staggerIndex={index}
                    >
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        ping={clickPingUrl(baseUrl, page.uri, link.url, 'link')}
                        className="group flex items-center gap-4 p-5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1"
                        href={link.url}
                      >
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center overflow-hidden group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                          {link.icon ? (
                            <Image
                              className="w-full h-full object-cover rounded-xl"
                              src={link.icon}
                              alt={`${link.title} icon`}
                              width={56}
                              height={56}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faLink}
                              className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg mb-1 truncate group-hover:text-cyan-400 transition-colors duration-300">
                            {link.title}
                          </h3>
                          {link.subtitle && (
                            <p className="text-slate-500 text-sm truncate">
                              {link.subtitle}
                            </p>
                          )}
                        </div>
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Contact Section */}
          <section id="contact" className="py-24 bg-gradient-to-b from-slate-900/50 to-slate-950">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
              <ScrollReveal animation="fade-up">
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-6">
                  Let&apos;s Work Together
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                  Have a project in mind? I&apos;d love to hear about it. Send me a message and let&apos;s create something amazing together.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="scale-up" delay={200}>
                <div className="flex flex-wrap gap-4 justify-center">
                  {page.buttons?.email && (
                    <Link
                      href={`mailto:${page.buttons.email}`}
                      ping={clickPingUrl(baseUrl, page.uri, `mailto:${page.buttons.email}`, 'social')}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                      Send Email
                    </Link>
                  )}
                  {page.buttons?.linkedin && (
                    <Link
                      href={page.buttons.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      ping={clickPingUrl(baseUrl, page.uri, page.buttons.linkedin, 'social')}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-blue-700 text-white rounded-full font-semibold text-lg hover:bg-blue-800 transition-all duration-300 shadow-lg hover:scale-105"
                    >
                      <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5" />
                      LinkedIn
                    </Link>
                  )}
                  {page.buttons?.github && (
                    <Link
                      href={page.buttons.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      ping={clickPingUrl(baseUrl, page.uri, page.buttons.github, 'social')}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 border border-slate-700 text-white rounded-full font-semibold text-lg hover:bg-slate-700 transition-all duration-300 hover:scale-105"
                    >
                      <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
                      GitHub
                    </Link>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </section>
        </main>

        {/* === FOOTER === */}
        <footer className="py-12 bg-slate-950 border-t border-slate-800/50">
          <div className="max-w-6xl mx-auto flex justify-center">
            <div className="flex items-center gap-2 text-slate-500">
              <span>Made with</span>
              <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-red-500 animate-pulse" />
              <span>using</span>
              <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                LinkMate
              </Link>
            </div>
          </div>
        </footer>


        {/* Back to Top Button */}
        <Link
          href="#"
          className="fixed bottom-8 right-8 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/25 flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
          aria-label="Back to top"
        >
          <FontAwesomeIcon icon={faChevronUp} className="w-5 h-5" />
        </Link>
      </div>
    );
  } catch (error) {
    console.error("Error loading page:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center p-8 bg-slate-900 rounded-2xl shadow-xl max-w-md mx-4 border border-slate-800">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-slate-400 mb-8">We couldn&apos;t load this portfolio. Please try again later.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }
}