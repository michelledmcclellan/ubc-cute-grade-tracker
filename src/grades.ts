// 1. Data Definitions (Interfaces)
export interface Assignment {
    id: string;
    name: string;
    grade: string; // Stored as string so empty input boxes work smoothly
    weight: string;
    isHidden?: boolean;
    subItems?: SubItem[];
    dropLowest?: number;
}

export interface Course {
    id: string;
    code: string;
    goalGrade: number;
    assignments: Assignment[];
    gradeScheme?: GradeScheme;
}

export interface GradeTier {
    letter: string
    min: number;
    gpa?: number;
}

export interface GradeScheme {
    name: string;
    tiers: GradeTier[]; // sorted highest min to lowest min
}

export interface SubItem {
    id: string;
    name: string;
    grade: string;
    isHidden?: boolean;
}

// Editor modal prefills default as an example
export const DEFAULT_UBC_SCHEME: GradeScheme = {
    name: 'UBC',
    tiers: [
        { letter: "A+", min: 90, gpa: 4.33 },
        { letter: "A", min: 85, gpa: 4.00 },
        { letter: "A-", min: 80, gpa: 3.67 },
        { letter: "B+", min: 76, gpa: 3.33 },
        { letter: "B", min: 72, gpa: 3.00 },
        { letter: "B-", min: 68, gpa: 2.67 },
        { letter: "C+", min: 64, gpa: 2.33 },
        { letter: "C", min: 60, gpa: 2.00 },
        { letter: "C-", min: 55, gpa: 1.67 },
        { letter: "D", min: 50, gpa: 1.00 },
        { letter: "F", min: 0, gpa: 0.00 }
    ],
};

export function lookupGrade(
    percent: number,
    scheme: GradeScheme = DEFAULT_UBC_SCHEME
): { letter: string; gpa?: number } {
    const sorted = [...scheme.tiers].sort((a, b) => b.min - a.min);
    const match = sorted.find((tier) => percent >= tier.min) ?? sorted[sorted.length - 1];

    return match ? { letter: match.letter, gpa: match.gpa } : { letter: 'F', gpa: 0 };
}

export function calculateSubcategoryStats(assignment: Assignment): {
    earnedPoints: number;
    completedWeight: number;
    average: number | null;
    countedCount: number;
} {
    const totalWeight: number = parseFloat(assignment.weight);
    const items: SubItem[] = assignment.subItems ?? [];
    if (items.length === 0 || isNaN(totalWeight) || totalWeight <= 0) {
        return { earnedPoints: 0, completedWeight: 0, average: null, countedCount: 0 };
    }

    const dropCount: number = Math.max(
        0,
        Math.min(assignment.dropLowest ?? 0, items.length - 1)
    );
    const targetCount = Math.max(1, items.length - dropCount);
    const weightPerItem = totalWeight / targetCount;

    const validGrades = items
        .map((item) => parseFloat(item.grade))
        .filter((g) => !isNaN(g));

    if (validGrades.length === 0) {
        return { earnedPoints: 0, completedWeight: 0, average: null, countedCount: 0 };
    }

    validGrades.sort((a, b) => a - b);

    const countedGrades =
        validGrades.length > dropCount ? validGrades.slice(dropCount) : validGrades;

    const sum = countedGrades.reduce((acc, g) => acc + g, 0);
    const average = sum / countedGrades.length;
    const completedWeight = Math.min(totalWeight, countedGrades.length * weightPerItem);
    const earnedPoints = (average * completedWeight) / 100;

    return {
        earnedPoints,
        completedWeight,
        average,
        countedCount: countedGrades.length,
    };
}

export function calculateCourseStats(course: Course) {
    let earnedPoints = 0;
    let completedWeight = 0;

    for (const a of course.assignments) {
        if (a.subItems && a.subItems.length > 0) {
            const subStats = calculateSubcategoryStats(a);
            earnedPoints += subStats.earnedPoints;
            completedWeight += subStats.completedWeight;
        } else {
            const g = parseFloat(a.grade);
            const w = parseFloat(a.weight);

            if (!isNaN(g) && !isNaN(w) && w > 0) {
                earnedPoints += (g * w) / 100;
                completedWeight += w;
            }
        }
    }

    const currentAverage = completedWeight > 0 ? (earnedPoints / completedWeight) * 100 : 0;
    const remainingWeight = Math.max(0, 100 - completedWeight);

    const requiredOnRemaining =
        remainingWeight > 0 ? ((course.goalGrade - earnedPoints) / remainingWeight) * 100 : 0;

    return {
        earnedPoints,
        currentAverage,
        completedWeight,
        remainingWeight,
        requiredOnRemaining,
        hasGrades: completedWeight > 0,
        schemeName: course.gradeScheme?.name || 'UBC',
        ubcCurrent: lookupGrade(currentAverage, course.gradeScheme),
        ubcGoal: lookupGrade(course.goalGrade, course.gradeScheme),
    };
}

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

export function exportCourseTemplate(course: Course): string {
    const cleanedCourse: Course = {
        ...course,
        assignments: course.assignments.map((assignment) => ({
            ...assignment,
            grade: '', //empty grades for each instead of keeping those of the one sharing
            isHidden: false, //no need to hide when there are no grades
            subItems: assignment.subItems?.map((sub) => ({
                ...sub,
                grade: '',
            }))
        }))
    }
    return JSON.stringify(cleanedCourse, null, 2);
}

// New IDs assigned to avoid issues
export function importCourseTemplate(jsonString: string): Course | null {
    try {
        const parsed = JSON.parse(jsonString)
        if (!parsed || typeof parsed.code !== 'string' || !Array.isArray(parsed.assignments)) {
            return null;
        }

        return {
            ...parsed,
            id: crypto.randomUUID(),
            assignments: parsed.assignments.map((assignment: Assignment) => ({
                ...assignment,
                id: crypto.randomUUID(),
                grade: assignment.grade ?? '',
                subItems: assignment.subItems?.map((sub) => ({
                    ...sub,
                    id: crypto.randomUUID(),
                    grade: sub.grade ?? '',
                })),
            })),
        }
    } catch { // catches a malformed JSON from JSON.parse, returns null, prevents a crash as compared to throwing
        return null;
    }
}

// for drag and drop
export function reorderList<T>(list: T[], fromIndex: number, toIndex: number): T[] {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return list;
    const result = [...list]
    const [moved] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, moved);
    return result;
}
