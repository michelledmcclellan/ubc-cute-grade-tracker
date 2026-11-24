import { useState, useEffect } from 'react';
import {
  type Course,
  type Assignment,
  loadCourses,
  saveCourses,
  calculateCourseStats,
} from './grades';
import './App.css';
import { CozyDropdown, type DropdownMenuKey } from './components/Dropdown';
import { MASCOT_OPTIONS, MASCOTS, THEME_OPTIONS } from './constants';
import { AssignmentRow } from './components/AssignmentRow';

export default function App() {
  // 1. State: Load courses from localStorage when app opens
  const [courses, setCourses] = useState<Course[]>(() => loadCourses());
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id || '');
  const [newCourseName, setNewCourseName] = useState('');
  const [openMenu, setOpenMenu] = useState<DropdownMenuKey>(null);

  // added mascot funcitonality
  const [mascot, setMascot] = useState<string>(
    () => localStorage.getItem('ubc_mascot') || 'bunny'
  )
  useEffect(() => {
    localStorage.setItem('ubc_mascot', mascot);
  }, [mascot]);

  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem('ubc_theme') || ''
  );

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('ubc_theme', theme);
  }, [theme]);



  const cycleMascot = () => {
    const keys = Object.keys(MASCOTS);
    const nextIndex = (keys.indexOf(mascot) + 1) % keys.length;
    const nextMascot = keys[nextIndex];
    setMascot(nextMascot);
    localStorage.setItem('ubc_mascot', nextMascot);
  };

  // 2. Effect: Auto-save to localStorage whenever courses change
  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];
  const stats = calculateCourseStats(activeCourse);

  // Helper to update the currently selected course immutably
  const updateActiveCourse = (updater: (course: Course) => Course) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === activeCourse.id ? updater(c) : c))
    );
  };

  // Update a single cell in the assignment table
  const handleAssignmentChange = (
    id: string,
    field: keyof Assignment,
    value: string
  ) => {
    updateActiveCourse((course) => ({
      ...course,
      assignments: course.assignments.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  // Add a blank assignment row
  const handleAddRow = () => {
    updateActiveCourse((course) => ({
      ...course,
      assignments: [
        ...course.assignments,
        { id: crypto.randomUUID(), name: '', grade: '', weight: '' },
      ],
    }));
  };

  // Delete an assignment row
  const handleDeleteRow = (id: string) => {
    updateActiveCourse((course) => ({
      ...course,
      assignments: course.assignments.filter((a) => a.id !== id),
    }));
  };

  // Update an assignment row
  const handleUpdateRow = (updatedRow: Assignment) => {
    updateActiveCourse((course) => ({
      ...course,
      assignments: course.assignments.map((a) =>
        a.id === updatedRow.id ? updatedRow : a
      ),
    }));
  };

  // Add a new class tab
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    const newCourse: Course = {
      id: crypto.randomUUID(),
      code: newCourseName.trim().toUpperCase(),
      goalGrade: 80,
      assignments: [
        { id: crypto.randomUUID(), name: 'Assignments', grade: '', weight: '20' },
        { id: crypto.randomUUID(), name: 'Midterm', grade: '', weight: '30' },
        { id: crypto.randomUUID(), name: 'Final Exam', grade: '', weight: '50' },
      ],
    };
    setCourses([...courses, newCourse]);
    setActiveCourseId(newCourse.id);
    setNewCourseName('');
  };

  // Delete a class tab
  const handleDeleteCourse = (id: string) => {
    if (courses.length <= 1) return; // Keep at least one course
    const filtered = courses.filter((c) => c.id !== id);
    setCourses(filtered);
    if (activeCourseId === id) {
      setActiveCourseId(filtered[0].id);
    }
  };

  // Toggle visibility of your grades
  const handleToggleVisibility = (id: string) => {
    updateActiveCourse((course) => ({
      ...course,
      assignments: course.assignments.map((row) =>
        row.id === id ? { ...row, isHidden: !row.isHidden } : row
      ),
    }));
  };

  // Cute bunny reaction message based on stats
  const getBunnyMessage = () => {
    if (!stats.hasGrades) return 'type in some grades & weights to start! ⋆｡°✩';
    if (stats.remainingWeight === 0) {
      return `course complete!! final mark: ${stats.currentAverage.toFixed(1)}% (${stats.ubcCurrent.letter}) ★`;
    }
    if (stats.requiredOnRemaining > 100) {
      return `eep! you'd need ${stats.requiredOnRemaining.toFixed(1)}% on the remaining ${stats.remainingWeight.toFixed(1)}%... maybe adjust your goal? (｡•́︿•̀｡)`;
    }
    if (stats.requiredOnRemaining <= 0) {
      return `you already locked in ${activeCourse.goalGrade}% (${stats.ubcGoal.letter}) even with 0% on the rest!! ⸜(｡˃ ᵕ ˂ )⸝♡`;
    }
    if (stats.currentAverage >= 90) {
      return `wow!! your average is ${stats.currentAverage.toFixed(1)}%?!? great job ദ്ദി ˉ͈̀꒳ˉ͈́ )✧`;
    }
    return `you got this!! you need ${stats.requiredOnRemaining.toFixed(1)}% on the remaining ${stats.remainingWeight.toFixed(1)}% to hit ${activeCourse.goalGrade.toFixed(1)}% (${stats.ubcGoal.letter}) (๑°꒵°๑)･*♡`;
  };

  return (
    <div className="app-container">
      {/* Header with ASCII Bunny & Speech Bubble */}
      <header className="ascii-header">
        <pre
          className="bunny-art"
          onClick={cycleMascot}
          title="Click to switch mascot!"
          style={{ cursor: 'pointer' }}
        >
          {MASCOTS[mascot]}
        </pre>
        <div className="header-text">
          <div className="title-banner">
            ┌──────────────────────────────┐
            <br />│ ✿ UBC GRADE ESTIMATOR ✿ {"      "}│
            <br />
            └──────────────────────────────┘
          </div>
          <div className="speech-bubble">
            <span className="bubble-arrow">‹ </span>
            {getBunnyMessage()}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="dropdown-toolbar">
              <CozyDropdown
                menuKey="theme"
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                value={theme}
                options={THEME_OPTIONS}
                onChange={setTheme}
                prefixLabel="theme"
              />

              <CozyDropdown
                menuKey="mascot"
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                value={mascot}
                options={MASCOT_OPTIONS}
                onChange={setMascot}
                prefixLabel="mascot"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Course Tabs Bar */}
      <nav className="course-tabs">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`tab ${course.id === activeCourse.id ? 'active' : ''}`}
            onClick={() => setActiveCourseId(course.id)}
          >
            <span>{course.code}</span>
            {courses.length > 1 && (
              <button
                className="delete-tab-btn"
                title="Delete course"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourse(course.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}

        <form onSubmit={handleAddCourse} className="new-course-form">
          <input
            type="text"
            placeholder="+ new class (e.g. COGS 200)"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
          />
          <button type="submit">add</button>
        </form>
      </nav>

      {/* Main Course Card */}
      <main className="calculator-card">
        <div className="table-header">
          <span>Assignment / Exam</span>
          <span>Grade (%)</span>
          <span>Weight (%)</span>
          <span></span>
        </div>

        <div className="assignment-list">
          {activeCourse.assignments.map((row) => (
            <AssignmentRow
              key={row.id}
              row={row}
              onChange={handleAssignmentChange}
              onToggleVisibility={handleToggleVisibility}
              onDelete={handleDeleteRow}
              onUpdateRow={handleUpdateRow}
            />

          ))}
        </div>

        <button className="add-row-btn" onClick={handleAddRow}>
          + add more rows
        </button>

        <div className="ascii-divider">
          ══════════════════ ⋆★⋆ ══════════════════
        </div>

        {/* Final Grade Planning & Summary */}
        <section className="summary-section">
          <div className="goal-box">
            <label htmlFor="goal-input">Final Grade Goal (%):</label>
            <div className="goal-input-group">
              <input
                id="goal-input"
                type="number"
                min="0"
                max="100"
                value={activeCourse.goalGrade}
                onChange={(e) =>
                  updateActiveCourse((c) => ({
                    ...c,
                    goalGrade: Number(e.target.value),
                  }))
                }
              />
              <span className="ubc-badge">
                UBC {stats.ubcGoal.letter} {stats.ubcGoal.gpa !== undefined && ` (${stats.ubcGoal.gpa.toFixed(2)} GPA)`}
              </span>
            </div>
            <p className="remaining-note">
              Weight of remaining tasks: <strong>{stats.remainingWeight.toFixed(1)}%</strong> (completed: {stats.completedWeight.toFixed(1)}%)
            </p>
          </div>

          <div className="stats-readout">
            <div className="stat-item">
              <span className="stat-label">Current Average:</span>
              <span className="stat-value">
                {stats.hasGrades
                  ? `${stats.currentAverage.toFixed(1)}% (${stats.ubcCurrent.letter})`
                  : '--'}
              </span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-label">Needed on Remaining {stats.remainingWeight.toFixed(1)}%:</span>
              <span className="stat-value">
                {stats.remainingWeight > 0
                  ? `${stats.requiredOnRemaining.toFixed(1)}%`
                  : 'Done!'}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}