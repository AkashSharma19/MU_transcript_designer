export interface TranscriptHeader {
    instituteName: string;
    subHeader: string;
    documentTitle: string;
    academicYear: string;
    logo: string | null;
}

export interface StudentDetails {
    name: string;
    rollNo: string;
    status: string;
}

// New Data Models for Automated Tables
export interface ColumnConfig {
    showCredits: boolean;
    creditsLabel: string;
    showGrade: boolean;
    gradeLabel: string;
    showGPA: boolean;
    gpaLabel: string;
    showPercentage: boolean;
    percentageLabel: string;
    showCourseType: boolean;
    courseTypeLabel: string;
    format: 'grid' | 'list'; // New property for table layout
}

// System Values are now categorized
export interface SystemValues {
    [key: string]: { // key is the "Class Type" e.g., "InClass", "OutClass"
        creditsRequired: string;
        creditsAwarded: string;
        cgpa: string;
    }
}

// Configuration for a single summary table
export interface SummaryTableConfig {
    id: string;
    type: string; // "InClass", "OutClass", or custom
    isVisible: boolean; // Controls if the table is shown at all
    showCreditsRequired: boolean;
    creditsRequiredLabel: string;
    showCreditsAwarded: boolean;
    creditsAwardedLabel: string;
    showCGPA: boolean;
    cgpaLabel: string;
}

export interface SummaryConfig {
    version: number; // to detect schema changes if needed
    sections: SummaryTableConfig[];
}

export interface Course {
    id: string;
    code: string;
    name: string;
    credits: string;
    grade: string;
    gpa: string;
    percentage: string;
    courseType?: string; // e.g., "Core", "Elective"
}

export interface Term {
    id: string;
    name: string; // "Term I"
    type: 'InClass' | 'OutClass';
    courses: Course[];
}



export interface TranscriptFooter {
    signature: string | null;
    signatoryName: string;
    signatoryDesignation: string;
    footerText: string; // "Academic Council" etc
    date: string;
    location: string;
}

export interface TranscriptData {
    header: TranscriptHeader;
    student: StudentDetails;
    courseData: Term[];
    tableConfigs: {
        inClass: ColumnConfig;
        outClass: ColumnConfig;
    };
    summaryConfig: SummaryConfig;
    systemValues: SystemValues;
    footer: TranscriptFooter;
    isUnifiedTables: boolean;
}

export interface TranscriptTemplate {
    id: string;
    name: string;
    lastModified: string;
    programs: string[]; // e.g. ["PGP TBM", "UG"]
    cohorts: string[];  // e.g. ["Class of 2024", "Class of 2025"]
    data: TranscriptData;
}
