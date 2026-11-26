# ✿ UBC Grade Estimator

A cute, terminal-inspired grade calculator built for UBC students—and customizable for any university or grading scale.

## Links
**The App:** [ubc-cute-grade-tracker.vercel.app](https://ubc-cute-grade-tracker.vercel.app/) | **Devlog:** *(in progress)*

## Install as a Standalone App (Dock / Home Screen)
Because this app includes a web manifest and runs 100% client-side, you can pin it to your Dock or Home Screen so it opens in its own standalone window without browser tabs:

- **macOS (Safari):** Open [ubc-cute-grade-tracker.vercel.app](https://ubc-cute-grade-tracker.vercel.app/), click **File** in the top menu bar → **Add to Dock...** → **Add**.
- **macOS / Windows (Google Chrome):** Open the [ubc-cute-grade-tracker.vercel.app](https://ubc-cute-grade-tracker.vercel.app/), click the **Install icon** (`⊕` / monitor with down-arrow) on the right side of the address bar, or open the **⋮ menu** → **Cast, save, and share** → **Install page as app...**
- **macOS / Windows (Microsoft Edge):** Open the [ubc-cute-grade-tracker.vercel.app](https://ubc-cute-grade-tracker.vercel.app/), click the **App available** icon in the address bar, or open the **⋯ menu** → **Apps** → **Install this site as an app**.
- **iOS / iPadOS (Safari):** Open the [ubc-cute-grade-tracker.vercel.app](https://ubc-cute-grade-tracker.vercel.app/), tap the **Share** button (`□↑`) → **Add to Home Screen** → **Add**.
- **Android (Chrome):** Open the [ubc-cute-grade-tracker.vercel.app](https://ubc-cute-grade-tracker.vercel.app/), tap the **⋮ menu** → **Add to Home screen** / **Install app**.

## Features
- **Target Grade & Weighted Math:** Real-time calculation of your current weighted average, remaining course weight, and the exact percentage needed on remaining deliverables to hit your goal.
- **Custom Grading Scales:** Defaults to the official UBC percentage/letter/GPA scale, with a per-course scale editor supporting custom letter cutoffs, optional GPAs, and automatic persistence in shared templates.
- **Drag-and-Drop Reordering:** Reorder course tabs and assignment rows using native HTML5 drag-and-drop powered by a generic `useDragReorder<T>` custom React hook with directional drop indicators.
- **Subcategories & "Drop Lowest" Logic:** Split weighted categories (like Labs or Quizzes) into individual items with automatic per-item weighting and mid-semester edge-case protection so partial grades never divide by zero.
- **Zero-Backend Course Sharing:** Copy and paste course syllabus templates as JSON strings straight from the clipboard to share setups with classmates without exposing personal grades.
- **Cozy Terminal Aesthetics:** 7 CSS-variable themes (`strawberry`, `matcha`, `midnight`, `cosmic`, `lilac`, `latte`, `espresso`) and swappable ASCII mascots, persisted locally via `localStorage`.
- **Privacy Mode & Safe Deletions:** One-click grade masking (`(ᴗ_ ᴗ。)`) for studying in public spaces without layout shifts, plus two-click inline delete confirmations.
- *(in progress)* **Sub-Item Drag-and-Drop:** Extending `useDragReorder<T>` to reorder individual deliverables inside expanded subcategory drawers.
- *(in progress)* **Cumulative Term GPA & Multi-Course Summary:** An overview bar aggregating weighted GPA and average across all active course tabs.
- *(in progress)* **"What-If" Scenario Matrix:** A collapsible finals-week planner projecting final course percentages and letter grades across hypothetical scores on remaining coursework.
- *(in progress)* **Per-Course Scratchpad & Task List:** A collapsible terminal notes drawer per course tab (with future support for deliverable to-do checklists).
- *(in progress)* **Keyboard Shortcuts:** Quick navigation (`Esc` to close modals/drawers, shortcuts for adding rows and toggling privacy mode).

## Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Styling:** Custom CSS with CSS Variables (`:root` / `data-theme`), reusable surface/input/button primitives, CSS Grid, and Flexbox
- **Persistence:** Browser `localStorage` (100% client-side, zero database latency)

## Architecture & Bug Fix Highlights
- **Pure Math Engine (`src/grades.ts`):** Separated all weighted-average, drop-lowest, template serialization, and letter-grade lookup logic from React UI components for predictable state updates and easy testing.
- **Generic Prop-Getter Hook (`src/hooks/useDragReorder.ts`):** Abstracted drag state and directional (`before`/`after`) drop indicators into a reusable type-safe hook shared across course tabs and assignment rows.
- **Defensive Mid-Semester Drop Rules:** When dropping the lowest $D$ items in a category of $N$ tasks, the engine dynamically weights each counted item at $W / \max(1, N - D)$ and only applies drops once more than $D$ items have been graded.
- **Cross-Platform Layout Stability:** Replaced conditional DOM element swapping with a single `<input>` toggling `readOnly` and `type` attributes so privacy masking never causes OS-specific height shifts.