// 1. Data Definitions (Interfaces)
export interface Assignment {
    id: string;
    name: string;
    grade: string; // Stored as string so empty input boxes work smoothly
    weight: string;
    isHidden?: boolean;
}

export interface Course {
    id: string;
    code: string;
    goalGrade: number;
    assignments: Assignment[];
}

// 2. UBC Official Grading Scale Lookup
export function getUBCLetterGrade(percentage: number): { letter: string; gpa: number } {
    const p = Math.round(percentage);
    if (p >= 90) return { letter: 'A+', gpa: 4.33 };
    if (p >= 85) return { letter: 'A', gpa: 4.00 };
    if (p >= 80) return { letter: 'A-', gpa: 3.67 };
    if (p >= 76) return { letter: 'B+', gpa: 3.33 };
    if (p >= 72) return { letter: 'B', gpa: 3.00 };
    if (p >= 68) return { letter: 'B-', gpa: 2.67 };
    if (p >= 64) return { letter: 'C+', gpa: 2.33 };
    if (p >= 60) return { letter: 'C', gpa: 2.00 };
    if (p >= 55) return { letter: 'C-', gpa: 1.67 };
    if (p >= 50) return { letter: 'D', gpa: 1.00 };
    return { letter: 'F', gpa: 0.00 };
}

// 3. Weighted Grade Math
export function calculateCourseStats(course: Course) {
    let earnedPoints = 0;
    let completedWeight = 0;

    for (const a of course.assignments) {
        const g = parseFloat(a.grade);
        const w = parseFloat(a.weight);

        // Only count rows where both grade and weight are valid numbers
        if (!isNaN(g) && !isNaN(w) && w > 0) {
            earnedPoints += (g * w) / 100;
            completedWeight += w;
        }
    }

    const currentAverage = completedWeight > 0 ? (earnedPoints / completedWeight) * 100 : 0;
    const remainingWeight = Math.max(0, 100 - completedWeight);

    // What grade do you need on the remaining tasks to reach goalGrade?
    const requiredOnRemaining =
        remainingWeight > 0 ? ((course.goalGrade - earnedPoints) / remainingWeight) * 100 : 0;

    return {
        earnedPoints,
        currentAverage,
        completedWeight,
        remainingWeight,
        requiredOnRemaining,
        hasGrades: completedWeight > 0,
        ubcCurrent: getUBCLetterGrade(currentAverage),
        ubcGoal: getUBCLetterGrade(course.goalGrade),
    };
}

// 4. LocalStorage Persistence & Starter Course
const STORAGE_KEY = 'ubc_ascii_grade_tracker_v1';

export const DEFAULT_COURSES: Course[] = [
    {
        id: 'course-1',
        code: 'CPSC 210',
        goalGrade: 85,
        assignments: [
            { id: '1', name: 'Participation', grade: '100', weight: '5' },
            { id: '2', name: 'Labs & Quizzes', grade: '92', weight: '15' },
            { id: '3', name: 'Term Project', grade: '88', weight: '25' },
            { id: '4', name: 'Midterm', grade: '78', weight: '20' },
            { id: '5', name: 'Final Exam', grade: '', weight: '35' },
        ],
    },
];

export function loadCourses(): Course[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_COURSES;
    try {
        return JSON.parse(saved);
    } catch {
        return DEFAULT_COURSES;
    }
}

export function saveCourses(courses: Course[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}