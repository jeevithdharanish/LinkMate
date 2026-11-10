"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaptopCode, faCode, faServer, faTools, faGraduationCap, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import ScrollReveal from "@/components/animations/ScrollReveal";

// Skill categories with icons
const categoryConfig = {
  "Programming Languages": { icon: faCode, color: "from-blue-500 to-purple-500", showProgress: true },
  "Frontend Development": { icon: faLaptopCode, color: "from-blue-500 to-purple-500", showProgress: true },
  "Backend Development": { icon: faServer, color: "from-blue-500 to-purple-500", showProgress: true },
  "Tools & Technologies": { icon: faTools, color: "from-blue-500 to-purple-500", showProgress: true },
  "Related Coursework": { icon: faGraduationCap, color: "from-blue-500 to-purple-500", showProgress: false },
  "Other Coursework": { icon: faBookOpen, color: "from-blue-500 to-purple-500", showProgress: false },
};

// Skill icons mapping
const skillIcons = {
  "Python": "/skills/python.svg",
  "JavaScript": "/skills/javascript.svg",
  "TypeScript": "/skills/typescript.svg",
  "Java": "/skills/java.svg",
  "C++": "/skills/cpp.svg",
  "C": "/skills/c.svg",
  "Go": "/skills/go.svg",
  "Rust": "/skills/rust.svg",
  "React": "/skills/react.svg",
  "Next.js": "/skills/nextjs.svg",
  "Vue.js": "/skills/vue.svg",
  "Angular": "/skills/angular.svg",
  "HTML": "/skills/html.svg",
  "CSS": "/skills/css.svg",
  "Tailwind CSS": "/skills/tailwind.svg",
  "Bootstrap": "/skills/bootstrap.svg",
  "SASS": "/skills/sass.svg",
  "Node.js": "/skills/nodejs.svg",
  "Express.js": "/skills/express.svg",
  "Django": "/skills/django.svg",
  "Flask": "/skills/flask.svg",
  "Spring Boot": "/skills/spring.svg",
  "FastAPI": "/skills/fastapi.svg",
  "GraphQL": "/skills/graphql.svg",
  "Git": "/skills/git.svg",
  "Docker": "/skills/docker.svg",
  "AWS": "/skills/aws.svg",
  "MongoDB": "/skills/mongodb.svg",
  "PostgreSQL": "/skills/postgresql.svg",
  "MySQL": "/skills/mysql.svg",
  "Redis": "/skills/redis.svg",
  "Firebase": "/skills/firebase.svg",
  "Linux": "/skills/linux.svg",
  "VS Code": "/skills/vscode.svg",
};

// Case-insensitive lookup so "Javascript" and "JavaScript" resolve the same icon.
const skillIconsLower = Object.fromEntries(
  Object.entries(skillIcons).map(([name, path]) => [name.toLowerCase(), path])
);

// Shows the skill's SVG logo, or its first letter if there is no logo
// or the file fails to load (e.g. missing from public/skills/).
function SkillIcon({ name }) {
  const iconPath = skillIconsLower[name.trim().toLowerCase()];
  const [failed, setFailed] = useState(false);

  if (iconPath && !failed) {
    return (
      <Image
        src={iconPath}
        alt=""
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="text-2xl font-bold text-blue-400" aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export default function SkillsSection({ skills }) {
  const [activeCategory, setActiveCategory] = useState(null);

  let categorizedSkills = {};

  if (Array.isArray(skills)) {
    categorizedSkills = {
      "All Skills": skills.map(skill => ({ name: skill, proficiency: 80 }))
    };
  } else if (skills && typeof skills === 'object') {
    categorizedSkills = skills;
  }

  const categories = Object.keys(categorizedSkills);

  if (categories.length === 0) {
    return null;
  }

  // Derive effective category without calling setState during render
  const effectiveCategory = (activeCategory !== null && categories.includes(activeCategory))
    ? activeCategory
    : categories[0];

  const currentSkills = categorizedSkills[effectiveCategory] || [];

  // Get the config icon for the effective category (used in coursework chips)
  const currentCategoryConfig = categoryConfig[effectiveCategory] || { icon: faBookOpen, color: "from-blue-500 to-purple-500", showProgress: true };

  return (
    <section className="group">
      {/* Section Header */}
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-4">
            <FontAwesomeIcon icon={faLaptopCode} className="w-4 h-4" />
            Tech Stack
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="text-white">My </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Skills</span>
          </h2>
          <p className="text-zinc-400 mt-4 text-lg">
            Technologies and tools I use to bring ideas to life
          </p>
        </div>
      </ScrollReveal>

      {/* Category Tabs */}
      <ScrollReveal animation="fade-up" delay={150}>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => {
            const config = categoryConfig[category] || { icon: faCode, color: "from-blue-500 to-purple-500" };
            const isActive = effectiveCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
                className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${isActive
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg scale-105`
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:border-zinc-600 hover:text-white"
                  }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Active Category Title */}
      <h3 className="text-xl font-bold text-white text-center mb-8">
        {effectiveCategory}
      </h3>

      {/* Skills Grid */}
      {(() => {
        const showProgress = currentCategoryConfig.showProgress !== false;

        // For Related Coursework, show as tags/chips with pop-in
        if (!showProgress) {
          return (
            <ScrollReveal animation="fade-up" delay={250}>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {currentSkills.map((skill, index) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name;
                  return (
                    <span
                      key={skillName}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-800 pop-in-animated"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <FontAwesomeIcon icon={currentCategoryConfig.icon} className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{skillName}</span>
                    </span>
                  );
                })}
              </div>
            </ScrollReveal>
          );
        }

        // Regular skills with animated progress bars
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {currentSkills.map((skill, index) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              const proficiency = typeof skill === 'object' ? skill.proficiency : 80;

              return (
                <ScrollReveal
                  key={skillName}
                  animation="scale-up"
                  delay={100}
                  stagger={80}
                  staggerIndex={index}
                >
                  <div className="group/card bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-5 border border-zinc-700/50 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                      {/* Skill Icon */}
                      <div className="w-12 h-12 bg-zinc-700/50 rounded-xl flex items-center justify-center overflow-hidden">
                        <SkillIcon name={skillName} />
                      </div>

                      {/* Skill Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">{skillName}</h4>
                        <p className="text-zinc-400 text-sm">{proficiency}% Proficiency</p>
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full progress-fill-animated"
                        style={{ width: `${proficiency}%`, animationDelay: `${300 + index * 100}ms` }}
                      />
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        );
      })()}
    </section>
  );
}