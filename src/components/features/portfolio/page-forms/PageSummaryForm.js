"use client";
import { useRef, useState } from "react";
import SectionBox from "@/components/layout/SectionBox";
import SubmitButton from "@/components/ui/SubmitButton";
import HighlightedText from "@/components/ui/HighlightedText";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faUser, faHighlighter } from "@fortawesome/free-solid-svg-icons";
import { savePageSummary } from "@/actions/pageActions";
import { countHighlights } from "@/lib/highlight";
import FormHeader from "@/components/ui/FormHeader";
import { toast } from "react-hot-toast";

const MARK = '==';
const RECOMMENDED_MAX = 6;

export default function PageSummaryForm({ page }) {
  const [summary, setSummary] = useState(page?.summary || "");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);
  const highlightCount = countHighlights(summary);

  // Wrap the selected words in ==…==, or unwrap them if already highlighted.
  function toggleHighlight() {
    const el = textareaRef.current;
    if (!el) return;
    let start = el.selectionStart;
    let end = el.selectionEnd;

    // Don't include surrounding spaces in the highlight
    while (start < end && /\s/.test(summary[start])) start++;
    while (end > start && /\s/.test(summary[end - 1])) end--;

    if (start === end) {
      toast("Select some words first, then click Highlight.");
      return;
    }

    const selected = summary.slice(start, end);
    if (selected.includes('\n')) {
      toast.error("Highlights can't span multiple lines.");
      return;
    }

    let next, selStart, selEnd;
    const wrappedOutside =
      summary.slice(start - MARK.length, start) === MARK && summary.slice(end, end + MARK.length) === MARK;
    const wrappedInside = selected.startsWith(MARK) && selected.endsWith(MARK) && selected.length > MARK.length * 2;

    if (wrappedOutside) {
      next = summary.slice(0, start - MARK.length) + selected + summary.slice(end + MARK.length);
      selStart = start - MARK.length;
      selEnd = selStart + selected.length;
    } else if (wrappedInside) {
      const inner = selected.slice(MARK.length, -MARK.length);
      next = summary.slice(0, start) + inner + summary.slice(end);
      selStart = start;
      selEnd = start + inner.length;
    } else {
      next = summary.slice(0, start) + MARK + selected.replaceAll(MARK, '') + MARK + summary.slice(end);
      selStart = start + MARK.length;
      selEnd = selStart + selected.replaceAll(MARK, '').length;
    }

    setSummary(next);
    // Restore the selection on the (un)highlighted words after React re-renders
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      toggleHighlight();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await savePageSummary(page.uri, summary);

      if (result.success) {
        toast.success("About Me saved!");
      } else {
        toast.error(`Error: ${result.message || 'Could not save.'}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error("Error in handleSubmit:", error);
    }

    setIsSaving(false);
  }

  return (
    <SectionBox>
      <FormHeader title="About Me" description="Introduce yourself — shown in the About Me section of your page" icon={faUser} />
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleHighlight}
            // Keep the textarea selection when the button is clicked
            onMouseDown={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
            title="Highlight selected words (Ctrl/⌘ + H)"
          >
            <FontAwesomeIcon icon={faHighlighter} className="w-3.5 h-3.5" />
            Highlight
            <kbd className="hidden sm:inline text-[10px] font-sans px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Ctrl/⌘ H</kbd>
          </button>
          <span className={`text-xs ${highlightCount > RECOMMENDED_MAX ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {highlightCount === 0
              ? 'Select key words and click Highlight to make them stand out'
              : `${highlightCount} highlight${highlightCount === 1 ? '' : 's'}${highlightCount > RECOMMENDED_MAX ? ' — fewer is stronger' : ''}`}
          </span>
        </div>

        {/* Split view: editor (left) | live preview (right); stacks on small screens */}
        <div className="grid lg:grid-cols-2 gap-4 items-stretch">
          <div className="flex flex-col">
            <label htmlFor="summaryIn" className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Edit</label>
            <textarea
              id="summaryIn"
              ref={textareaRef}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a short introduction about yourself..."
              className="flex-1 w-full min-h-[320px] p-4 mb-0 border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm leading-relaxed resize-none"
            />
          </div>

          {/* Live preview — always dark, matching the public page */}
          <div className="flex flex-col">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Preview on your page</p>
            <div className="flex-1 min-h-[320px] rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-line overflow-y-auto">
              {summary.trim()
                ? <HighlightedText text={summary} />
                : <span className="text-zinc-500">Your About Me preview will appear here.</span>}
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4">
          <SubmitButton
            disabled={isSaving}
            className="max-w-xs mx-auto">
            <FontAwesomeIcon icon={faSave} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </SubmitButton>
        </div>
      </form>
    </SectionBox>
  );
}
