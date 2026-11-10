import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faExternalLinkAlt, faRocket, faClock, faLaptopCode, faFolder } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { clickPingUrl } from "@/lib/urlHelpers";

// Split a project summary into bullet points.
// Prefers explicit newlines, falls back to splitting on sentences;
// returns [] when the summary should render as a plain paragraph.
function summaryToBullets(summary) {
  if (!summary) return [];

  if (summary.includes('\n')) {
    return summary
      .split('\n')
      .filter(line => line.trim())
      // strip leading "-", "•" or "*" markers the user may have typed
      .map(line => line.replace(/^[-•*]\s*/, ''));
  }

  if (summary.includes('. ')) {
    return summary
      .split('. ')
      .filter(sentence => sentence.trim())
      // re-add the period that split() removed
      .map(sentence => sentence.trim().endsWith('.') ? sentence.trim() : sentence.trim() + '.');
  }

  return [];
}

export default function ProjectSection({ projects, baseUrl, pageUri }) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="group">
      {/* Section Header */}
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-4">
            <FontAwesomeIcon icon={faFolder} className="w-4 h-4" />
            My Work
          </span>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            Featured Projects
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid gap-8">
        {projects.map((project, index) => (
          <ScrollReveal
            key={project._id}
            animation="scale-up"
            delay={100}
            stagger={200}
            staggerIndex={index}
          >
            <div className="group/card relative">
              <div className="relative bg-zinc-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-zinc-700/50 hover:border-zinc-600 transition-colors duration-300">
                {/* Project Header with animated gradient shimmer accent */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 gradient-shimmer"></div>

                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4 mb-5">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                          <FontAwesomeIcon icon={faLaptopCode} className="w-5 h-5 text-blue-400" />
                        </span>
                        {project.title}
                      </h3>
                      {project.timeTaken && (
                        <p className="text-sm text-zinc-500 mt-2 flex items-center gap-2 ml-[3.25rem]">
                          <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" />
                          {project.timeTaken}
                        </p>
                      )}
                    </div>
                    {project.techStacks && (
                      <div className="flex flex-wrap gap-2">
                        {project.techStacks.split(',').map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-3 py-1.5 bg-zinc-700/50 text-zinc-300 rounded-lg border border-zinc-600/50 hover:border-blue-500/30 transition-colors"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project Summary: bullet list when it splits cleanly, paragraph otherwise */}
                  <div className="text-zinc-400 leading-relaxed">
                    {summaryToBullets(project.summary).length > 0 ? (
                      <ul className="space-y-2">
                        {summaryToBullets(project.summary).map((point, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-base">{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-lg">{project.summary}</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-zinc-700/50">
                    {project.githubLink && (
                      <Link
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        ping={clickPingUrl(baseUrl, pageUri, project.githubLink, 'project')}
                        className="group/btn inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
                      >
                        <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
                        <span>View Code</span>
                      </Link>
                    )}

                    {project.liveLink && (
                      <Link
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        ping={clickPingUrl(baseUrl, pageUri, project.liveLink, 'project')}
                        className="group/btn inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4" />
                        <span>Live Demo</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}