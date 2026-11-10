"use client";
import { useState } from "react";
import SectionBox from "@/components/layout/SectionBox";
import SubmitButton from "@/components/ui/SubmitButton";
import FormHeader from "@/components/ui/FormHeader";
import Typewriter from "@/components/animations/Typewriter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faBriefcase, faPlus, faSave, faXmark } from "@fortawesome/free-solid-svg-icons";
import { savePageRoles } from "@/actions/pageActions";
import { getHeroRoles, MAX_ROLES, MAX_ROLE_LENGTH } from "@/lib/roles";
import { toast } from "react-hot-toast";

// Editor for the job titles cycled under the name in the portfolio hero.
export default function PageRolesForm({ page }) {
  // Start from what the hero shows today, so saving without edits keeps it.
  const [roles, setRoles] = useState(() => getHeroRoles(page));
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const atLimit = roles.length >= MAX_ROLES;

  function addRole() {
    const value = draft.trim();
    if (!value) return;
    if (roles.some((r) => r.toLowerCase() === value.toLowerCase())) {
      toast.error("That role is already in the list.");
      return;
    }
    if (atLimit) {
      toast.error(`You can add up to ${MAX_ROLES} roles.`);
      return;
    }
    setRoles([...roles, value]);
    setDraft("");
  }

  function removeRole(index) {
    setRoles(roles.filter((_, i) => i !== index));
  }

  function moveRole(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= roles.length) return;
    const next = [...roles];
    [next[index], next[target]] = [next[target], next[index]];
    setRoles(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await savePageRoles(page.uri, roles);
      if (result.success) {
        setRoles(result.roles);
        toast.success("Roles saved!");
      } else {
        toast.error(`Error: ${result.message || "Could not save."}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error("Error saving roles:", error);
    }
    setIsSaving(false);
  }

  return (
    <SectionBox>
      <FormHeader
        title="Roles / Titles"
        description="Job titles that type out one by one under your name"
        icon={faBriefcase}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Add a role */}
        <div className="flex gap-2">
          <label htmlFor="roleIn" className="sr-only">New role</label>
          <input
            id="roleIn"
            type="text"
            value={draft}
            maxLength={MAX_ROLE_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter adds the role instead of submitting the form
              if (e.key === "Enter") {
                e.preventDefault();
                addRole();
              }
            }}
            disabled={atLimit}
            placeholder={atLimit ? `Maximum of ${MAX_ROLES} roles reached` : "e.g. MERN Stack Developer"}
            className="flex-1 mb-0 p-3 border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm disabled:opacity-60"
          />
          <button
            type="button"
            onClick={addRole}
            disabled={atLimit || !draft.trim()}
            className="inline-flex items-center gap-2 px-4 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* Current roles, in display order */}
        {roles.length > 0 ? (
          <ol className="space-y-2">
            {roles.map((role, i) => (
              <li
                key={role}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/50"
              >
                <span className="w-5 text-xs font-semibold text-zinc-400 tabular-nums">{i + 1}</span>
                <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-100">{role}</span>
                <button type="button" onClick={() => moveRole(i, -1)} disabled={i === 0} aria-label={`Move ${role} up`}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 disabled:opacity-30 disabled:pointer-events-none">
                  <FontAwesomeIcon icon={faArrowUp} className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => moveRole(i, 1)} disabled={i === roles.length - 1} aria-label={`Move ${role} down`}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 disabled:opacity-30 disabled:pointer-events-none">
                  <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => removeRole(i)} aria-label={`Remove ${role}`}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No roles yet. The line under your name will be hidden.</p>
        )}

        {/* Live preview — always dark, matching the public page */}
        {roles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Preview on your page</p>
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center text-lg text-zinc-400 min-h-[3.5rem]">
              {/* key: restart the animation when the list changes */}
              <Typewriter key={roles.join("|")} words={roles} speed={80} delay={1500} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{roles.length}/{MAX_ROLES} roles</span>
          <SubmitButton disabled={isSaving} className="max-w-xs">
            <FontAwesomeIcon icon={faSave} />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </SubmitButton>
        </div>
      </form>
    </SectionBox>
  );
}
