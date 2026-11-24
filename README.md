# ✿ UBC Grade Estimator

A cute but functional grade calculator built for ubc students (future updates will allow for custom grade schemes).

## Links
**The App: [https://ubc-cute-grade-tracker.vercel.app/]** / **Devlog: [in progress]**

## Features
* **Target Grade & Weighted Math:** Real-time calculation of your current weighted average, remaining course weight, and the exact percentage needed on remaining deliverables to hit your goal.
* **Cozy Terminal Aesthetics:** Multiple CSS-variable themes (`strawberry`, `matcha`, `midnight`) and swappable ASCII mascots, persisted locally via `localStorage`.
* **Privacy Mode:** One-click grade masking (`(ᴗ_ ᴗ。)`) for studying in public spaces without layout shifts.
**Subcategories & "Drop Lowest" Logic:** Split weighted categories (like Labs or Quizzes) into individual items with automatic per-item weighting and mid-semester edge-case protection so partial grades never divide by zero.
**Zero-Backend Course Sharing:** Export and import course syllabus templates as local JSON files to share setups with classmates without exposing personal grades.
* *(in progress)* **Custom Grading Scales:** Defaults to the official UBC percentage/letter/GPA scale, with support for custom grading schemes per course.
* *(in progress)* **Drag And Drop** Uses built-in HTML drag and drop functionality to move around course tabs, assignments, and sub-assignments. 

## Tech Stack
* **Frontend:** React, TypeScript, Vite
* **Styling:** Custom CSS with CSS Variables (`:root` / `data-theme`), CSS Grid, and Flexbox
* **Persistence:** Browser `localStorage` (100% client-side, zero database latency)

## Bug Fix Highlights
* **Pure Math Engine (`src/grades.ts`):** Separated all weighted-average, drop-lowest, and letter-grade lookup logic from React UI components for predictable state updates and easy testing.
* **Defensive Mid-Semester Drop Rules:** When dropping the lowest $D$ items in a category of $N$ tasks, the engine dynamically weights each counted item at $W / \max(1, N - D)$ and only applies drops once more than $D$ items have been graded.
* **Cross-Platform Layout Stability:** Replaced conditional DOM element swapping with a single `<input>` toggling `readOnly` and `type` attributes so privacy masking never causes OS-specific height shifts.