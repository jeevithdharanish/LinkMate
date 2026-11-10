import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faCalendarAlt, faBuilding, faCheckCircle, faRocket } from "@fortawesome/free-solid-svg-icons";
import ScrollReveal from "@/components/animations/ScrollReveal";

// This component displays your "work" history with timeline
export default function WorkExperienceSection({ workExperience }) {
  if (!workExperience || workExperience.length === 0) {
    return null;
  }

  return (
    <section className="group">
      {/* Section Header */}
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-4">
            <FontAwesomeIcon icon={faRocket} className="w-4 h-4" />
            Career Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
            Work Experience
          </h2>
        </div>
      </ScrollReveal>

      {/* Timeline container */}
      <div className="relative">
        {/* Timeline line — animated draw */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 hidden md:block overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500/20 timeline-line-animated"></div>
        </div>

        <div className="space-y-8">
          {workExperience.map((work, index) => (
            <ScrollReveal
              key={work._id}
              animation="slide-left"
              delay={100}
              stagger={150}
              staggerIndex={index}
            >
              <div className="relative md:pl-16 group/item">
                {/* Timeline dot */}
                <div className="absolute left-4 top-8 w-5 h-5 bg-zinc-950 border-4 border-blue-500 rounded-full shadow-lg shadow-blue-500/20 hidden md:flex items-center justify-center group-hover/item:scale-125 transition-transform duration-300 dot-pulse">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                </div>

                <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-zinc-700/50 hover:border-blue-500/30 transition-all duration-500 group-hover/item:-translate-y-1">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white group-hover/item:text-blue-400 transition-colors duration-300">
                        {work.role}
                      </h3>
                      <p className="text-zinc-400 font-medium flex items-center gap-2 mt-2">
                        <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-blue-500" />
                        {work.company}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-medium flex-shrink-0">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5" />
                      {work.start} – {work.end}
                    </span>
                  </div>
                  {work.bullets && work.bullets.length > 0 && (
                    <ul className="space-y-3 mt-5">
                      {work.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3 text-zinc-400">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                          />
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}