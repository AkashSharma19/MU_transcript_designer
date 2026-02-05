import React, { createContext, useContext, useState } from 'react';
import { type TranscriptData, type Term, type ColumnConfig, type SummaryTableConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Automated Data Setup
const initialCourseData: Term[] = [
    {
        id: uuidv4(),
        name: "Term I",
        type: "InClass",
        courses: [
            { id: uuidv4(), code: "ADA1101", name: "Fundamentals of Statistics", credits: "4", grade: "B-", gpa: "2.33", percentage: "65%", courseType: "Core" },
            { id: uuidv4(), code: "ENTP1001", name: "Art of Communication", credits: "4", grade: "D", gpa: "1.00", percentage: "45%", courseType: "Core" },
            { id: uuidv4(), code: "ENTP1103", name: "Business and Legal Management", credits: "4", grade: "B", gpa: "2.67", percentage: "72%", courseType: "Elective" },
        ]
    },
    {
        id: uuidv4(),
        name: "Term II",
        type: "InClass",
        courses: [
            { id: uuidv4(), code: "ENTP1102", name: "Fundamentals of Corporate Communication", credits: "4", grade: "A", gpa: "3.67", percentage: "88%" },
            { id: uuidv4(), code: "ENTP1305", name: "Macroeconomics | How Economy Affects Business", credits: "4", grade: "B+", gpa: "3.00", percentage: "78%" },
        ]
    },
    {
        id: uuidv4(),
        name: "Term I",
        type: "OutClass",
        courses: [
            { id: uuidv4(), code: "OC1201", name: "Dropshipping- First Paycheck Challenge", credits: "10", grade: "A", gpa: "3.67", percentage: "90%" },
        ]
    },
    {
        id: uuidv4(),
        name: "Term II",
        type: "OutClass",
        courses: [
            { id: uuidv4(), code: "UGTBM28", name: "UG 28 Summer Internship 2025", credits: "10", grade: "A+", gpa: "4.00", percentage: "95%" },
        ]
    },
    {
        id: uuidv4(),
        name: "Term III",
        type: "OutClass",
        courses: [
            { id: uuidv4(), code: "CCC28", name: "Content Creator Challenge", credits: "10", grade: "-", gpa: "-", percentage: "-" },
        ]
    }
];

const initialData: TranscriptData = {
    header: {
        instituteName: "Masters' Union",
        subHeader: "UG Programme in Technology and Business Management",
        documentTitle: "Provisional Transcript",
        academicYear: "Academic Year 2024 - 28",
        logo: null,
    },
    student: {
        name: "Rahul Sharma",
        rollNo: "PGP/2023/1042",
        status: "Awaiting",
    },
    courseData: initialCourseData,
    tableConfigs: {
        inClass: {
            showCredits: true,
            creditsLabel: "Credits",
            showGrade: true,
            gradeLabel: "Grade",
            showGPA: true,
            gpaLabel: "GPA",
            showPercentage: false,
            percentageLabel: "Percentage",
            showCourseType: false,
            courseTypeLabel: "Type",
            format: 'grid',
        },
        outClass: {
            showCredits: true,
            creditsLabel: "Credits",
            showGrade: true,
            gradeLabel: "Grade",
            showGPA: true,
            gpaLabel: "GPA",
            showPercentage: false,
            percentageLabel: "Percentage",
            showCourseType: false,
            courseTypeLabel: "Type",
            format: 'list',
        }
    },
    isUnifiedTables: false,
    summaryConfig: {
        version: 1,
        sections: [
            {
                id: "inclass-default",
                type: "InClass",
                isVisible: true,
                showCreditsRequired: true,
                creditsRequiredLabel: "Total Credits (InClass)",
                showCreditsAwarded: true,
                creditsAwardedLabel: "Total Credits Awarded",
                showCGPA: true,
                cgpaLabel: "InClass CGPA",
            },
            {
                id: "outclass-default",
                type: "OutClass",
                isVisible: false,
                showCreditsRequired: true,
                creditsRequiredLabel: "Total Credits (OutClass)",
                showCreditsAwarded: true,
                creditsAwardedLabel: "Total Credits Awarded",
                showCGPA: true,
                cgpaLabel: "OutClass CGPA",
            },
            {
                id: "overall-default",
                type: "Overall",
                isVisible: false,
                showCreditsRequired: true,
                creditsRequiredLabel: "Total Credits",
                showCreditsAwarded: true,
                creditsAwardedLabel: "Total Credits Awarded",
                showCGPA: true,
                cgpaLabel: "Overall CGPA",
            }
        ]
    },
    systemValues: {
        "InClass": {
            creditsRequired: "100",
            creditsAwarded: "72",
            cgpa: "3.07"
        },
        "OutClass": {
            creditsRequired: "30",
            creditsAwarded: "20",
            cgpa: "2.56"
        },
        "Overall": {
            creditsRequired: "130",
            creditsAwarded: "92",
            cgpa: "2.98"
        }
    },
    footer: {
        signature: null,
        signatoryName: "Swati Ganeti",
        signatoryDesignation: "Director, Undergraduate Programmes",
        footerText: "On behalf of the Academic Council",
        date: "January 14, 2026",
        location: "Gurugram, India",
    }
};

interface TranscriptContextType {
    data: TranscriptData;
    updateHeader: (key: string, value: string) => void;
    updateStudent: (key: string, value: string) => void;
    updateFooter: (key: string, value: string) => void;
    toggleColumn: (tableType: 'inClass' | 'outClass', column: keyof ColumnConfig) => void;
    updateColumnLabel: (tableType: 'inClass' | 'outClass', column: keyof ColumnConfig, label: string) => void;
    updateTableFormat: (tableType: 'inClass' | 'outClass', format: 'grid' | 'list') => void;
    toggleUnifiedTables: () => void;
    toggleSummarySectionVisibility: (id: string) => void;
    toggleSummaryField: (sectionId: string, field: keyof Omit<SummaryTableConfig, 'id' | 'type' | 'isVisible'>) => void;
    updateSummaryFieldLabel: (sectionId: string, field: keyof Omit<SummaryTableConfig, 'id' | 'type' | 'isVisible'>, label: string) => void;
    setData: React.Dispatch<React.SetStateAction<TranscriptData>>;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined);

export function TranscriptProvider({ children, initialData: propInitialData }: { children: React.ReactNode, initialData?: TranscriptData }) {
    const [data, setData] = useState<TranscriptData>(propInitialData || initialData);

    // Sync State with Initial Data structure if missing sections (Fix to ensure new tables appear)
    React.useEffect(() => {
        setData(prev => {
            const currentSectionIds = new Set(prev.summaryConfig.sections.map(s => s.id));
            const newSections = initialData.summaryConfig.sections.filter(s => !currentSectionIds.has(s.id));

            let updatedSections = prev.summaryConfig.sections;
            let hasDirectUpdates = false;

            if (newSections.length > 0) {
                updatedSections = [...prev.summaryConfig.sections, ...newSections];
                hasDirectUpdates = true;
            }

            if (newSections.length > 0 || hasDirectUpdates) {
                return {
                    ...prev,
                    summaryConfig: {
                        ...prev.summaryConfig,
                        sections: [...updatedSections, ...newSections]
                    }
                };
            }

            // Migration: Ensure tableConfigs exists (migrating from old columnConfig)
            if (!prev.tableConfigs) {
                return {
                    ...prev,
                    tableConfigs: initialData.tableConfigs
                };
            }

            return prev;
        });
    }, []);

    const updateHeader = (key: string, value: string) => {
        setData(prev => ({ ...prev, header: { ...prev.header, [key]: value } }));
    };

    const updateStudent = (key: string, value: string) => {
        setData(prev => ({ ...prev, student: { ...prev.student, [key]: value } }));
    };

    const updateFooter = (key: string, value: string) => {
        setData(prev => ({ ...prev, footer: { ...prev.footer, [key]: value } }));
    };

    const toggleColumn = (tableType: 'inClass' | 'outClass', column: keyof ColumnConfig) => {
        setData(prev => ({
            ...prev,
            tableConfigs: {
                ...prev.tableConfigs,
                [tableType]: {
                    ...prev.tableConfigs[tableType],
                    [column]: !prev.tableConfigs[tableType][column]
                }
            }
        }));
    };

    const updateColumnLabel = (tableType: 'inClass' | 'outClass', column: keyof ColumnConfig, label: string) => {
        setData(prev => ({
            ...prev,
            tableConfigs: {
                ...prev.tableConfigs,
                [tableType]: {
                    ...prev.tableConfigs[tableType],
                    [column]: label
                }
            }
        }));
    };

    const updateTableFormat = (tableType: 'inClass' | 'outClass', format: 'grid' | 'list') => {
        setData(prev => ({
            ...prev,
            tableConfigs: {
                ...prev.tableConfigs,
                [tableType]: {
                    ...prev.tableConfigs[tableType],
                    format: format
                }
            }
        }));
    };

    const toggleUnifiedTables = () => {
        setData(prev => ({
            ...prev,
            isUnifiedTables: !prev.isUnifiedTables
        }));
    };

    const toggleSummarySectionVisibility = (id: string) => {
        setData(prev => ({
            ...prev,
            summaryConfig: {
                ...prev.summaryConfig,
                sections: prev.summaryConfig.sections.map(s =>
                    s.id === id ? { ...s, isVisible: !s.isVisible } : s
                )
            }
        }));
    };

    const toggleSummaryField = (sectionId: string, field: keyof Omit<SummaryTableConfig, 'id' | 'type' | 'isVisible'>) => {
        setData(prev => ({
            ...prev,
            summaryConfig: {
                ...prev.summaryConfig,
                sections: prev.summaryConfig.sections.map(section => {
                    if (section.id !== sectionId) return section;
                    // Start of workaround for TS indexing
                    const val = section[field] as boolean;
                    return { ...section, [field]: !val };
                })
            }
        }));
    };

    const updateSummaryFieldLabel = (sectionId: string, field: keyof Omit<SummaryTableConfig, 'id' | 'type' | 'isVisible'>, label: string) => {
        setData(prev => ({
            ...prev,
            summaryConfig: {
                ...prev.summaryConfig,
                sections: prev.summaryConfig.sections.map(section => {
                    if (section.id !== sectionId) return section;
                    return { ...section, [field]: label };
                })
            }
        }));
    };

    return (
        <TranscriptContext.Provider value={{
            data,
            updateHeader,
            updateStudent,
            updateFooter,
            toggleColumn,
            updateColumnLabel,
            updateTableFormat,
            toggleUnifiedTables,
            toggleSummarySectionVisibility,
            toggleSummaryField,
            updateSummaryFieldLabel,
            setData
        }}>
            {children}
        </TranscriptContext.Provider>
    );
}

export function useTranscript() {
    const context = useContext(TranscriptContext);
    if (context === undefined) {
        throw new Error('useTranscript must be used within a TranscriptProvider');
    }
    return context;
}
