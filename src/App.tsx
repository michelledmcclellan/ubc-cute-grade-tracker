import { useState, useEffect } from 'react';
import {
  type Course,
  type Assignment,
  loadCourses,
  saveCourses,
  calculateCourseStats,
  exportCourseTemplate,
  importCourseTemplate,
} from './grades';
import './App.css';
import { CozyDropdown, type DropdownMenuKey } from './components/Dropdown';
import { MASCOT_OPTIONS, MASCOTS, THEME_OPTIONS } from './constants';
import { AssignmentRow } from './components/AssignmentRow';
import { useDragReorder } from './hooks/useDragReorder';

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
      return `eep! you'd need ${stats.requiredOnRemaining.toFixed(1)}% on the remaining ${stats.remainingWeight}%... maybe adjust your goal? (｡•́︿•̀｡)`;
    }
    if (stats.requiredOnRemaining <= 0) {
      return `you already locked in ${activeCourse.goalGrade}% (${stats.ubcGoal.letter}) even with 0% on the rest!! ⸜(｡˃ ᵕ ˂ )⸝♡`;
    }
    if (stats.currentAverage >= 90) {
      return `wow!! your average is ${stats.currentAverage.toFixed(1)}%?!? great job ദ്ദി ˉ͈̀꒳ˉ͈́ )✧`;
    }
    return `you got this!! you need ${stats.requiredOnRemaining.toFixed(1)}% on the remaining ${stats.remainingWeight}% to hit ${activeCourse.goalGrade}% (${stats.ubcGoal.letter}) (๑°꒵°๑)･*♡`;
  };

  // Added an export/import course template functionality


  //inline paste bar functionality

  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');


  //handler that copies the template 
  const handleCopyTemplate = async () => {
    const json = exportCourseTemplate(activeCourse);
    await navigator.clipboard.writeText(json);
    showMascotMessage(`Copied ${activeCourse.code} syllabus to clipboard! ദ്ദി(｡•̀ ,<)~✩‧₊`)
  }

  // the handler for pasting the template in
  const handleImportSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!importText.trim()) return;

    const imported = importCourseTemplate(importText);
    if (!imported) {
      showMascotMessage(`uh oh!! seems like that was not a valid course template ( •̯́ ₃ •̯̀)`);
      return;
    }

    setCourses((prev) => [...prev, imported]);
    setActiveCourseId(imported.id);
    setImportText('');
    setIsImporting(false);
    showMascotMessage(`imported ${imported.code}!! ready to calculate some grades ₍₍⚞(˶˃ ᗜ ˂˶)⚟⁾⁾`)
  }

  // helper to put a temporary message into the mascot speech bubble

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showMascotMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((current) => (current === msg ? null : current));
    }, 4000); // Reverts to the default mascot message after 4 seconds
  }

  //course tab delete confirmation

  //tracks the course id curently waiting to be confirmed
  const [confirmDeleteCourseId, setConfirmDeleteCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmDeleteCourseId) return;
    const timer = setTimeout(() => setConfirmDeleteCourseId(null), 3000);
    return () => clearTimeout(timer);
  }, [confirmDeleteCourseId]);

  // assignment drag using hook calls

  const assignmentDrag = useDragReorder(
    activeCourse.assignments,
    (newAssignments) =>
      updateActiveCourse((course) => ({ ...course, assignments: newAssignments }))
  );

  // course drag using hook call

  const courseTabDrag = useDragReorder(courses, setCourses);


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
            <br />│ ✿ UBC GRADE ESTIMATOR ✿                         │
            <br />
            └──────────────────────────────┘
          </div>
          <div className="speech-bubble">
            <span className="bubble-arrow">⟢ </span>
            {statusMessage ?? getBunnyMessage()}
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
        {courses.map((course, index) => {
          const { isDragging, dropPosition, ...dragHandlers } = courseTabDrag.getItemProps(index);

          return (
            <div
              key={course.id}
              draggable
              {...dragHandlers}
              className={`tab ${course.id === activeCourse.id ? 'active' : ''} ${isDragging ? 'is-dragging' : ''
                } ${dropPosition === 'before' ? 'is-drag-over-left' : ''} ${dropPosition === 'after' ? 'is-drag-over-right' : ''
                }`}
              onClick={() => setActiveCourseId(course.id)}
              title="Click to switch, drag to reorder"
            >
              <span>{course.code}</span>
              {courses.length > 1 && (
                <button
                  type="button"
                  className={`delete-tab-btn ${confirmDeleteCourseId === course.id ? 'confirming' : ''}`}
                  title={
                    confirmDeleteCourseId === course.id
                      ? 'Click again to delete course'
                      : 'Delete course'
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmDeleteCourseId === course.id) {
                      handleDeleteCourse(course.id);
                      setConfirmDeleteCourseId(null);
                    } else {
                      setConfirmDeleteCourseId(course.id);
                    }
                  }}
                >
                  {confirmDeleteCourseId === course.id ? '⦸' : '×'}
                </button>
              )}
            </div>
          );
        })}

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
          <span className="header-name-cell">Assignment / Exam</span>
          <span>Grade (%)</span>
          <span>Weight (%)</span>
          <span></span>
          <span></span>
        </div>

        <div className="assignment-list">
          {activeCourse.assignments.map((row, index) => {
            const { isDragging, dropPosition, ...dragHandlers } = assignmentDrag.getItemProps(index);

            return (
              <AssignmentRow
                key={row.id}
                row={row}
                isDragging={isDragging}
                dropPosition={dropPosition}
                {...dragHandlers}
                onChange={handleAssignmentChange}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDeleteRow}
                onUpdateRow={handleUpdateRow}
              />
            );
          })}
        </div>

        <div className="course-actions">
          <button type="button" className="add-row-btn" onClick={handleAddRow}>
            + add more rows
          </button>

          <div className="share-buttons">
            <button type="button" className="sub-action-btn" onClick={handleCopyTemplate}>
              copy template
            </button>

            {!isImporting ? (
              <button
                type="button"
                className="sub-action-btn"
                onClick={() => setIsImporting(true)}
              >
                import template
              </button>
            ) : (
              <form className="import-inline-form" onSubmit={handleImportSubmit}>
                <input
                  type="text"
                  className="cozy-input"
                  placeholder="Paste course JSON..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="sub-action-btn">
                  add
                </button>
                <button
                  type="button"
                  className="remove-row-btn"
                  onClick={() => {
                    setIsImporting(false);
                    setImportText('');
                  }}
                  title="Cancel import"
                >
                  [x]
                </button>
              </form>
            )}
          </div>
        </div>




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
              Weight of remaining tasks: <strong>{stats.remainingWeight}%</strong> (completed: {stats.completedWeight}%)
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
              <span className="stat-label">Needed on Remaining {stats.remainingWeight}%:</span>
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