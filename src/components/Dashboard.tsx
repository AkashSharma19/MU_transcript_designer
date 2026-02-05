import { Plus, Calendar, X, Check, Calculator, FileSpreadsheet, FileText, History, LayoutTemplate, RotateCw, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { TranscriptTemplate } from '../types';

interface DashboardProps {
    templates: TranscriptTemplate[];
    onCreate: () => void;
    onEdit: (id: string) => void;
    onUpdateTemplateMeta: (id: string, updates: Partial<TranscriptTemplate>) => void;
}

// Reusable MultiSelect Component
function MultiSelect({
    options,
    selected,
    onChange,
    placeholder
}: {
    options: string[],
    selected: string[],
    onChange: (selected: string[]) => void,
    placeholder: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className="min-h-[38px] w-full rounded-md border-gray-300 shadow-sm border bg-white px-2 py-1 flex flex-wrap items-center gap-1 cursor-pointer hover:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected.length === 0 && (
                    <span className="text-gray-400 text-sm pl-1">{placeholder}</span>
                )}
                {selected.map(item => (
                    <span key={item} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full border border-indigo-100">
                        {item}
                        <div
                            role="button"
                            onClick={(e) => { e.stopPropagation(); toggleOption(item); }}
                            className="hover:bg-indigo-200 rounded-full p-0.5"
                        >
                            <X size={10} />
                        </div>
                    </span>
                ))}
            </div>

            {isOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
                    {options.map(option => {
                        const isSelected = selected.includes(option);
                        return (
                            <div
                                key={option}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${isSelected ? 'text-indigo-900 bg-indigo-50 font-medium' : 'text-gray-900'}`}
                                onClick={() => toggleOption(option)}
                            >
                                <span className="block truncate">{option}</span>
                                {isSelected && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                        <Check size={16} />
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const MOCK_TERMS = [
    { id: 't1', name: 'Term I' },
    { id: 't2', name: 'Term II' },
    { id: 't3', name: 'Term III' },
    { id: 't4', name: 'Term IV' },
    { id: 't5', name: 'Term V' },
    { id: 't6', name: 'Term VI' },
];



function CalculationModal({ isOpen, onClose, programs, cohorts, templates }: {
    isOpen: boolean;
    onClose: () => void;
    programs: string[];
    cohorts: string[];
    templates: TranscriptTemplate[];
}) {
    if (!isOpen) return null;
    const [tgpaStatus, setTgpaStatus] = useState<Record<string, { value: number, date: string } | null>>({});
    const [calculating, setCalculating] = useState<string | null>(null);
    const [generatingReport, setGeneratingReport] = useState<string | null>(null); // Track report generation per term
    const [cgpa, setCgpa] = useState<{ value: number, date: string, tillTerm: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedCohort, setSelectedCohort] = useState("");
    const [transcriptData, setTranscriptData] = useState<{ url: string, date: string } | null>(null);
    const [termReportStatus, setTermReportStatus] = useState<Record<string, { url: string, date: string } | null>>({});

    // Load saved state when Program or Cohort changes
    useEffect(() => {
        if (selectedProgram && selectedCohort) {
            const key = `calc_state_${selectedProgram}_${selectedCohort}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const data = JSON.parse(saved);
                setTgpaStatus(data.tgpaStatus || {});
                setCgpa(data.cgpa || null);
                setTranscriptData(data.transcriptData || null);
                setTermReportStatus(data.termReportStatus || {});
            } else {
                // Reset if no saved data for this combination
                setTgpaStatus({});
                setCgpa(null);
                setTranscriptData(null);
                setTermReportStatus({});
            }
        } else {
            // Reset if selection is incomplete
            setTgpaStatus({});
            setCgpa(null);
            setTranscriptData(null);
            setTermReportStatus({});
        }
    }, [selectedProgram, selectedCohort]);

    // Helper to save state
    const saveState = (updates: any) => {
        if (!selectedProgram || !selectedCohort) return;
        const key = `calc_state_${selectedProgram}_${selectedCohort}`;

        const newState = {
            tgpaStatus: updates.tgpaStatus !== undefined ? updates.tgpaStatus : tgpaStatus,
            cgpa: updates.cgpa !== undefined ? updates.cgpa : cgpa,
            transcriptData: updates.transcriptData !== undefined ? updates.transcriptData : transcriptData,
            termReportStatus: updates.termReportStatus !== undefined ? updates.termReportStatus : termReportStatus
        };

        localStorage.setItem(key, JSON.stringify(newState));
    };

    const appendHistoryLog = (action: string, details?: any) => {
        const historyItem = {
            id: crypto.randomUUID(),
            program: selectedProgram,
            cohort: selectedCohort,
            calculatedBy: "Admin",
            calculatedDate: new Date().toISOString(),
            status: action,
            details
        };
        const currentLog = JSON.parse(localStorage.getItem('transcript_maker_history') || '[]');
        localStorage.setItem('transcript_maker_history', JSON.stringify([historyItem, ...currentLog]));
    };



    const handleCalculateTgpa = (termId: string) => {
        setCalculating(termId);
        setTimeout(() => {
            const newStatus = {
                ...tgpaStatus,
                [termId]: {
                    value: (Math.random() * (4.0 - 3.0) + 3.0),
                    date: new Date().toLocaleDateString()
                }
            };
            setTgpaStatus(newStatus);
            saveState({ tgpaStatus: newStatus });
            appendHistoryLog(`TGPA Calculated (${MOCK_TERMS.find(t => t.id === termId)?.name})`);
            setCalculating(null);
        }, 800);
    };

    const handleCalculateCgpa = () => {
        setCalculating('cgpa');
        setTimeout(() => {
            const calculatedTerms = Object.keys(tgpaStatus).filter(k => tgpaStatus[k]);
            const values = calculatedTerms.map(k => tgpaStatus[k]!.value);

            // Find the latest term name (assuming MOCK_TERMS order is chronological)
            const lastTermId = calculatedTerms[calculatedTerms.length - 1];
            const lastTermName = MOCK_TERMS.find(t => t.id === lastTermId)?.name || "Unknown Term";

            const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

            const newCgpa = {
                value: avg,
                date: new Date().toLocaleDateString(),
                tillTerm: lastTermName
            };

            setCgpa(newCgpa);
            saveState({ cgpa: newCgpa });
            appendHistoryLog("CGPA Calculated", { tillTerm: lastTermName, value: avg.toFixed(2) });
            setCalculating(null);
        }, 1000);
    };

    const handleGenerateTermReport = (termId: string) => {
        // Find matching term-report template
        const matchingTemplate = templates.find(t =>
            t.types.includes('term-report') &&
            t.programs.includes(selectedProgram) &&
            t.cohorts.includes(selectedCohort)
        );

        if (!matchingTemplate) {
            alert(`No "Term Report" design found for Program: ${selectedProgram} and Cohort: ${selectedCohort}.\nPlease create or map a Term Report design first.`);
            return;
        }

        setGeneratingReport(termId);
        setTimeout(() => {
            const newReportStatus = {
                ...termReportStatus,
                [termId]: {
                    url: `mock_report_${termId}`,
                    date: new Date().toLocaleDateString()
                }
            };
            setTermReportStatus(newReportStatus);
            saveState({ termReportStatus: newReportStatus });
            appendHistoryLog(`Term Report Generated (${MOCK_TERMS.find(t => t.id === termId)?.name})`);
            setGeneratingReport(null);
        }, 1200);
    };

    const handleDownloadTermReport = (termId: string, termName: string) => {
        // termId would be used for API call in real implementation
        console.log(`Downloading report for term: ${termId}`);
        alert(`Downloading Term Report for ${termName}...`);
    };

    // Helper to generate mock TGPA Excel content
    const generateTGPACSV = (termName: string) => {
        const headers = [
            `Student Name (Term: ${termName})`, "Student Email",
            "Course Name 1 GPA", "Course Name 1 Credit",
            "Course Name 2 GPA", "Course Name 2 Credit",
            "InClass Credits", "InClass TGPA",
            "OutClass Credits", "OutClass TGPA",
            "Total Credits", "TGPA"
        ];
        const row1 = [
            "John Doe", "john.doe@example.com",
            "3.5", "4",
            "3.8", "3",
            "15", "3.6",
            "3", "4.0",
            "18", "3.65"
        ];
        return [headers.join(","), row1.join(",")].join("\n");
    };

    // Helper to generate mock CGPA Excel content
    const generateCGPACSV = () => {
        const computedTerms = Object.keys(tgpaStatus).filter(k => tgpaStatus[k]);

        // Dynamic headers based on computed terms
        const termHeaders = computedTerms.map((_, i) => `Term ${i + 1} TGPA,Term ${i + 1} Credit`);

        const headers = [
            "Student Name", "Student Email",
            ...termHeaders,
            "Total InClass Credits", "Total InClass CGPA",
            "OutClass Credits", "OutClass CGPA",
            "Total Credits", "CGPA"
        ];

        const termData = computedTerms.map(() => "3.5,15"); // Mock data

        const row1 = [
            "John Doe", "john.doe@example.com",
            ...termData,
            "45", "3.55",
            "12", "3.8",
            "57", "3.62"
        ];
        return [headers.join(","), row1.join(",")].join("\n");
    };

    const handleDownloadTGPA = (termId: string, termName: string) => {
        if (!tgpaStatus[termId]) return;

        const csvContent = generateTGPACSV(termName);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${termName}_TGPA_Calculation.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownloadCGPA = () => {
        if (!cgpa) return;

        const csvContent = generateCGPACSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Final_CGPA_Calculation.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleGenerateTranscript = () => {
        if (!selectedProgram || !selectedCohort) {
            alert("Please select a Program and Cohort first.");
            return;
        }

        // Find matching transcript template
        const matchingTemplate = templates.find(t =>
            t.types.includes('transcript') &&
            t.programs.includes(selectedProgram) &&
            t.cohorts.includes(selectedCohort)
        );

        if (!matchingTemplate) {
            alert(`No "Transcript" design found for Program: ${selectedProgram} and Cohort: ${selectedCohort}.\nPlease create or map a Transcript design first.`);
            return;
        }

        setIsGenerating(true);
        // Mock generation delay
        setTimeout(() => {
            setIsGenerating(false);
            const mockData = {
                url: "mock_zip_url",
                date: new Date().toLocaleDateString()
            };
            setTranscriptData(mockData);
            saveState({ transcriptData: mockData });
            appendHistoryLog("Transcripts Generated");
            alert("Transcripts Generated Successfully!");
        }, 1500);
    };

    const handleDownloadZip = () => {
        // Mock download zip
        alert("Downloading Transcripts ZIP...");
    };

    const getMatchingTemplate = (type: 'transcript' | 'term-report') => {
        if (!selectedProgram || !selectedCohort) return null;
        return templates.find(t =>
            t.types.includes(type) &&
            t.programs.includes(selectedProgram) &&
            t.cohorts.includes(selectedCohort)
        );
    };

    const hasTermReportDesign = getMatchingTemplate('term-report');
    const hasTranscriptDesign = getMatchingTemplate('transcript');

    // Removed unused allTgpaCalculated check

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calculator size={24} />
                        TGPA & CGPA Calculation
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Selectors */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Program</label>
                            <select
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-50 border text-gray-700"
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                            >
                                <option value="">Select Program...</option>
                                {programs.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cohort</label>
                            <select
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-50 border text-gray-700"
                                value={selectedCohort}
                                onChange={(e) => setSelectedCohort(e.target.value)}
                            >
                                <option value="">Select Cohort...</option>
                                {cohorts.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Disable interactions if selectors are unset */}
                    <div className={`${!selectedProgram || !selectedCohort ? 'opacity-50 pointer-events-none grayscale' : ''} transition-all duration-300`}>
                        <div className="space-y-4">
                            {MOCK_TERMS.map(term => (
                                <div key={term.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    {/* Term Header & Filters */}
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{term.name}</span>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCalculateTgpa(term.id)}
                                                    disabled={calculating === term.id}
                                                    className="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1"
                                                >
                                                    {calculating === term.id ? (
                                                        <div className="w-3 h-3 border-2 border-gray-400 border-t-indigo-600 rounded-full animate-spin" />
                                                    ) : (
                                                        <Calculator size={12} />
                                                    )}
                                                    {tgpaStatus[term.id] ? "Recalculate TGPA" : "Calculate TGPA"}
                                                </button>

                                                {/* Download Button per Term */}
                                                {tgpaStatus[term.id] && (
                                                    <button
                                                        onClick={() => handleDownloadTGPA(term.id, term.name)}
                                                        className="text-xs bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 px-2 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1"
                                                        title="Download TGPA Excel"
                                                    >
                                                        <FileSpreadsheet size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            {tgpaStatus[term.id] && (
                                                <div className="flex items-center gap-1 text-green-700">
                                                    <Check size={10} />
                                                    <span className="text-[10px] font-medium opacity-80">
                                                        Calculated on {tgpaStatus[term.id]?.date}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Term Report Section (Only if TGPA calculated) */}
                                    {tgpaStatus[term.id] && (
                                        <div className="mt-2 border-t border-gray-200 pt-2 flex flex-col items-end gap-2 animate-in slide-in-from-top-1">
                                            {!hasTermReportDesign ? (
                                                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded text-[10px] font-medium border border-amber-100 italic">
                                                    <X size={10} />
                                                    No "Term Report" design mapped
                                                </div>
                                            ) : termReportStatus[term.id] ? (
                                                <div className="flex items-center justify-end gap-2 w-full">
                                                    <div className="flex flex-col items-end mr-2">
                                                        <span className="text-[10px] text-gray-500">
                                                            Generated on {termReportStatus[term.id]?.date}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleGenerateTermReport(term.id)}
                                                        disabled={generatingReport === term.id}
                                                        className="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1"
                                                    >
                                                        {generatingReport === term.id ? (
                                                            <div className="w-3 h-3 border-2 border-gray-400 border-t-indigo-500 rounded-full animate-spin" />
                                                        ) : (
                                                            <RotateCw size={12} />
                                                        )}
                                                        Regenerate Report
                                                    </button>

                                                    <button
                                                        onClick={() => handleDownloadTermReport(term.id, term.name)}
                                                        className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-2 py-1.5 rounded shadow-sm transition-colors"
                                                        title="Download Term Report"
                                                    >
                                                        <Download size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleGenerateTermReport(term.id)}
                                                    disabled={generatingReport === term.id}
                                                    className="text-xs bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1"
                                                >
                                                    {generatingReport === term.id ? (
                                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <FileText size={12} />
                                                    )}
                                                    Generate Term Report
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-lg font-bold text-gray-900">Final CGPA</span>
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={handleCalculateCgpa}
                                        disabled={calculating === 'cgpa' || Object.keys(tgpaStatus).length === 0}
                                        className={`px-4 py-2 rounded-md font-medium text-white transition-all flex items-center gap-2 ${Object.keys(tgpaStatus).length > 0
                                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
                                            : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                    >
                                        {calculating === 'cgpa' ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Calculating...</span>
                                            </>
                                        ) : (
                                            <span>{cgpa ? "Recalculate CGPA" : "Calculate CGPA"}</span>
                                        )}
                                    </button>

                                    {cgpa && (
                                        <div className="flex flex-col items-end animate-in fade-in slide-in-from-top-2 duration-300">
                                            <span className="text-xs font-medium text-green-700 mt-1">Calculated till {cgpa.tillTerm}</span>
                                            <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-0.5">
                                                <Calendar size={10} />
                                                <span>Calculated on {cgpa.date}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {cgpa && (
                                <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-300">
                                    <button
                                        onClick={handleDownloadCGPA}
                                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        <FileSpreadsheet size={18} />
                                        Download CGPA Excel
                                    </button>

                                    {!hasTranscriptDesign ? (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                                                <X size={16} />
                                                No "Transcript" design mapped
                                            </div>
                                            <p className="text-[11px] text-amber-600 text-center">
                                                Please map a template with type "Transcript" to Program "{selectedProgram}" and Cohort "{selectedCohort}" to enable this action.
                                            </p>
                                        </div>
                                    ) : transcriptData ? (
                                        <div className="w-full">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleGenerateTranscript}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                                    disabled={isGenerating}
                                                >
                                                    {isGenerating ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <RotateCw size={18} />
                                                            Regenerate Transcripts
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handleDownloadZip}
                                                    className="w-14 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                                    title="Download Transcripts ZIP"
                                                >
                                                    <Download size={24} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs text-center mt-2">
                                                <Calendar size={10} />
                                                Generated on {transcriptData.date}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleGenerateTranscript}
                                            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                        >
                                            {isGenerating ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <FileText size={20} />
                                                    Generate Transcript
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default function Dashboard({ templates, onCreate, onEdit, onUpdateTemplateMeta }: DashboardProps) {
    const PROGRAM_OPTIONS = ["PGP TBM", "PGP Rise", "UG Programme", "Masters Union", "Executive MBA"];
    const COHORT_OPTIONS = ["Class of 2023", "Class of 2024", "Class of 2025", "Class of 2026", "Cohort 1", "Cohort 2"];
    const DESIGN_TYPE_OPTIONS = ["transcript", "term-report"];
    const [showCalculation, setShowCalculation] = useState(false);
    const [activeTab, setActiveTab] = useState<'designs' | 'history'>('designs');
    const [history, setHistory] = useState<any[]>([]);
    const [historyProgramFilter, setHistoryProgramFilter] = useState<string[]>([]);
    const [historyCohortFilter, setHistoryCohortFilter] = useState<string[]>([]);

    // Function to load calculation history from localStorage
    const loadHistory = () => {
        const items: any[] = [];

        // 1. Try reading explicit history log (New System)
        try {
            const historyLog = JSON.parse(localStorage.getItem('transcript_maker_history') || '[]');
            if (Array.isArray(historyLog)) {
                historyLog.forEach(item => {
                    items.push(item);
                });
            }
        } catch (e) {
            console.error("Failed to parse history log", e);
        }

        // 2. Fallback: Scan state snapshots (for Legacy/Current State support)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('calc_state_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');

                    const keyContent = key.substring(11); // remove "calc_state_"

                    let program = "Unknown";
                    let cohort = "Unknown";

                    for (const p of PROGRAM_OPTIONS) {
                        if (keyContent.startsWith(p + '_')) {
                            program = p;
                            cohort = keyContent.substring(p.length + 1);
                            break;
                        }
                    }

                    // Determine status
                    let status = "Pending";
                    let date = "-";

                    if (data.transcriptData) {
                        status = "Transcripts Generated";
                        date = data.transcriptData.date;
                    } else if (data.termReportStatus && Object.keys(data.termReportStatus).length > 0) {
                        const reportDates = Object.values(data.termReportStatus).map((d: any) => d.date);
                        status = "Term Reports Generated";
                        date = reportDates[reportDates.length - 1];
                    } else if (data.cgpa) {
                        status = "CGPA Calculated";
                        date = data.cgpa.date;
                    } else if (data.tgpaStatus && Object.keys(data.tgpaStatus).length > 0) {
                        status = "TGPA Calculated";
                        // Get latest date
                        const dates = Object.values(data.tgpaStatus).map((d: any) => d.date);
                        date = dates[dates.length - 1];
                    }

                    if (program !== "Unknown") {
                        // Simple dedup: if exact same program/cohort/status/date exists in log, skip this snapshot
                        const existsInLog = items.some(x =>
                            x.program === program &&
                            x.cohort === cohort &&
                            x.status === status &&
                            x.calculatedDate === date
                        );

                        if (!existsInLog) {
                            items.push({
                                id: key,
                                program,
                                cohort,
                                calculatedBy: "Admin", // Mock
                                calculatedDate: date,
                                status
                            });
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse history item", e);
                }
            }
        }

        // Sort by date logic (attempt to parse dates)
        setHistory(items.sort((a, b) => {
            const parseDate = (d: string) => {
                // Handle DD/MM/YYYY or YYYY-MM-DD or standard Date string
                // Assuming toLocaleDateString uses mostly standard formats or slashes
                // Simple attempt:
                const d1 = new Date(d);
                if (!isNaN(d1.getTime())) return d1.getTime();

                // Try DD/MM/YYYY
                const parts = d.split('/');
                if (parts.length === 3) {
                    // Assume DD/MM/YYYY vs MM/DD/YYYY? 
                    // US locale is MM/DD/YYYY. India is DD/MM/YYYY.
                    // Let's assume user locale. But we can't control it easily.
                    // Fallback: just return current time if fail
                    return 0;
                }
                return 0;
            };
            // Actually, comparing string timestamps is flawed if not ISO. 
            // Better to rely on creation timestamp if we had one.
            // For now, let's treat these as string comparisons as fallback or basic Date parse.
            return new Date(b.calculatedDate).getTime() - new Date(a.calculatedDate).getTime();
        }));
    };

    useEffect(() => {
        loadHistory();
    }, [showCalculation, activeTab]); // Reload when modal closes or tab changes

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage transcript templates and view calculation history</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowCalculation(true)}
                            className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            <Calculator size={20} />
                            <span>TGPA & CGPA Calculation</span>
                        </button>
                        <button
                            onClick={onCreate}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus size={20} />
                            <span>Create New Design</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6 w-fit">
                    <button
                        className={`flex items-center gap-2 w-full rounded-lg py-2.5 px-6 text-sm font-medium leading-5 whitespace-nowrap ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2 ${activeTab === 'designs'
                            ? 'bg-white text-indigo-700 shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-indigo-600'
                            }`}
                        onClick={() => setActiveTab('designs')}
                    >
                        <LayoutTemplate size={18} />
                        Transcript Designs
                    </button>
                    <button
                        className={`flex items-center gap-2 w-full rounded-lg py-2.5 px-6 text-sm font-medium leading-5 whitespace-nowrap ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2 ${activeTab === 'history'
                            ? 'bg-white text-indigo-700 shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-indigo-600'
                            }`}
                        onClick={() => setActiveTab('history')}
                    >
                        <History size={18} />
                        Calculation History
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
                    {activeTab === 'designs' ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                        Template Name
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">
                                        Design Type
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                        Mapped Program(s)
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                        Mapped Cohort(s)
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">
                                        Last Modified
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[100px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {templates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                                                    <Calendar size={24} />
                                                </div>
                                                <p className="text-base font-medium text-gray-900">No templates found</p>
                                                <p className="text-sm mt-1">Create your first transcript design to get started.</p>
                                                <button
                                                    onClick={onCreate}
                                                    className="mt-4 text-indigo-600 font-medium hover:text-indigo-800 text-sm"
                                                >
                                                    + Create New Design
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    templates.map((template) => (
                                        <tr key={template.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mr-3">
                                                        <Calendar size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{template.name || "Untitled Template"}</div>
                                                        <div className="text-xs text-gray-500">ID: {template.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <MultiSelect
                                                    placeholder="Select Types..."
                                                    options={DESIGN_TYPE_OPTIONS}
                                                    selected={template.types || []}
                                                    onChange={(newSelection) => onUpdateTemplateMeta(template.id, { types: newSelection as any })}
                                                />
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <MultiSelect
                                                    placeholder="Select Programs..."
                                                    options={PROGRAM_OPTIONS}
                                                    selected={template.programs}
                                                    onChange={(newSelection) => onUpdateTemplateMeta(template.id, { programs: newSelection })}
                                                />
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <MultiSelect
                                                    placeholder="Select Cohorts..."
                                                    options={COHORT_OPTIONS.filter(c =>
                                                        !templates.some(t => t.id !== template.id && t.cohorts.includes(c))
                                                    )}
                                                    selected={template.cohorts}
                                                    onChange={(newSelection) => onUpdateTemplateMeta(template.id, { cohorts: newSelection })}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                {new Date(template.lastModified).toLocaleDateString()}
                                                <span className="block text-xs text-gray-400">{new Date(template.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => onEdit(template.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-indigo-100 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div className="space-y-4">
                            {/* History Filters */}
                            <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Filter Program</label>
                                    <MultiSelect
                                        placeholder="All Programs"
                                        options={PROGRAM_OPTIONS}
                                        selected={historyProgramFilter}
                                        onChange={setHistoryProgramFilter}
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Filter Cohort</label>
                                    <MultiSelect
                                        placeholder="All Cohorts"
                                        options={COHORT_OPTIONS}
                                        selected={historyCohortFilter}
                                        onChange={setHistoryCohortFilter}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => { setHistoryProgramFilter([]); setHistoryCohortFilter([]); }}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-2"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Program
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Cohort
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Calculated By
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Last Action Date
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.filter(entry => {
                                        const matchesProgram = historyProgramFilter.length === 0 || historyProgramFilter.includes(entry.program);
                                        const matchesCohort = historyCohortFilter.length === 0 || historyCohortFilter.includes(entry.cohort);
                                        return matchesProgram && matchesCohort;
                                    }).length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                No calculation history found matching filters
                                            </td>
                                        </tr>
                                    ) : (
                                        history.filter(entry => {
                                            const matchesProgram = historyProgramFilter.length === 0 || historyProgramFilter.includes(entry.program);
                                            const matchesCohort = historyCohortFilter.length === 0 || historyCohortFilter.includes(entry.cohort);
                                            return matchesProgram && matchesCohort;
                                        }).map((entry) => (
                                            <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {entry.program}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {entry.cohort}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {entry.calculatedBy}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(entry.calculatedDate).toLocaleDateString()}
                                                    <span className="block text-xs text-gray-400">{new Date(entry.calculatedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.status.includes('Transcript')
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : entry.status.includes('Report')
                                                            ? 'bg-indigo-100 text-indigo-800'
                                                            : entry.status.includes('CGPA')
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Calculation Modal */}
                {showCalculation && (
                    <CalculationModal
                        isOpen={showCalculation}
                        onClose={() => {
                            setShowCalculation(false);
                            loadHistory(); // Refresh history when modal closes
                        }}
                        programs={PROGRAM_OPTIONS}
                        cohorts={COHORT_OPTIONS}
                        templates={templates}
                    />
                )}
            </div>
        </div>
    );
}
