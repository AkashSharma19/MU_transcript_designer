import React from 'react';
import { cn } from '../lib/utils';
import { useTranscript } from '../context/TranscriptContext';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import ColumnManager from './controls/ColumnManager';
import SummaryManager from './controls/SummaryManager';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const { data, updateHeader, updateStudent, updateFooter, toggleUnifiedTables } = useTranscript();

    return (
        <div className={cn("flex flex-col", className)}>
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold">Transcript Designer</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Section 1: Institute Info */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Institute Details</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Institute Name</label>
                            <input
                                type="text"
                                value={data.header.instituteName}
                                onChange={(e) => updateHeader('instituteName', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>

                        <LogoUpload onUpload={(url) => updateHeader('logo', url)} currentLogo={data.header.logo} />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Name</label>
                            <input
                                type="text"
                                value={data.header.subHeader}
                                onChange={(e) => updateHeader('subHeader', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Document Title</label>
                            <input
                                type="text"
                                value={data.header.documentTitle}
                                onChange={(e) => updateHeader('documentTitle', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                            <input
                                type="text"
                                value={data.header.academicYear}
                                onChange={(e) => updateHeader('academicYear', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Student Info */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Student Details</h2>
                    <div className="space-y-3">
                        <InputWithVariable
                            label="Student Name"
                            value={data.student.name}
                            onChange={(val) => updateStudent('name', val)}
                            variables={["{{student.name}}", "{{user.name}}"]}
                        />
                        <InputWithVariable
                            label="Roll Number"
                            value={data.student.rollNo}
                            onChange={(val) => updateStudent('rollNo', val)}
                            variables={["{{student.rollNo}}", "{{user.rollNo}}"]}
                        />
                        <InputWithVariable
                            label="Graduation Status"
                            value={data.student.status}
                            onChange={(val) => updateStudent('status', val)}
                            variables={["{{student.status}}", "{{date}}"]}
                        />
                    </div>
                </section>

                {/* Section 3: Tables & Columns */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">General Table Settings</h2>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Unified Table View</span>
                            <button
                                onClick={toggleUnifiedTables}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${data.isUnifiedTables ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <span
                                    className={`${data.isUnifiedTables ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Enable to combine InClass and OutClass courses into a single continuous table.
                        </p>
                    </div>

                    {data.isUnifiedTables ? (
                        <>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Unified Table Configuration</h2>
                            <ColumnManager tableType="inClass" />
                        </>
                    ) : (
                        <>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">InClass Table Configuration</h2>
                            <ColumnManager tableType="inClass" />

                            <div className="mt-6">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">OutClass Table Configuration</h2>
                                <ColumnManager tableType="outClass" />
                            </div>
                        </>
                    )}
                </section>

                {/* Section 4: Summary Table */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Summary Table</h2>
                    <SummaryManager />
                </section>

                {/* Section 5: Footer */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Footer & Signature</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Signatory Name</label>
                            <input
                                type="text"
                                value={data.footer.signatoryName}
                                onChange={(e) => updateFooter('signatoryName', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Signatory Title</label>
                            <input
                                type="text"
                                value={data.footer.signatoryDesignation}
                                onChange={(e) => updateFooter('signatoryDesignation', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>

                        <LogoUpload
                            label="Signature Image"
                            onUpload={(url) => updateFooter('signature', url)}
                            currentLogo={data.footer.signature}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="text"
                                value={data.footer.date}
                                onChange={(e) => updateFooter('date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function LogoUpload({ onUpload, currentLogo, label = "Upload Image" }: { onUpload: (url: string) => void, currentLogo: string | null, label?: string }) {
    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onUpload(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-indigo-500 bg-gray-50">
                <input {...getInputProps()} />
                {currentLogo ? (
                    <div className="flex flex-col items-center">
                        <img src={currentLogo} alt="Logo" className="h-10 object-contain mb-2" />
                        <p className="text-xs text-gray-500">Click or drag to replace</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Upload size={20} className="text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">{label}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function InputWithVariable({ label, value, onChange, variables }: {
    label: string,
    value: string,
    onChange: (val: string) => void,
    variables: string[]
}) {
    // Determine input ID for accessibility and potential focusing
    const [showVariables, setShowVariables] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowVariables(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleVariableClick = (variable: string) => {
        onChange(value + variable); // Append variable to current value
        setShowVariables(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 rounded-l-md border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 w-full"
                />
                <button
                    type="button"
                    onClick={() => setShowVariables(!showVariables)}
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100 focus:outline-none"
                    title="Insert Variable"
                >
                    <span className="font-mono text-xs">{"{ }"}</span>
                </button>
            </div>

            {showVariables && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-in fade-in zoom-in duration-100">
                    <div className="px-2 py-1 text-xs text-gray-500 border-b bg-gray-50 font-medium">Insert Variable</div>
                    {variables.map((variable) => (
                        <div
                            key={variable}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 hover:text-indigo-900 group"
                            onClick={() => handleVariableClick(variable)}
                        >
                            <span className="block truncate font-medium text-gray-900 group-hover:text-indigo-900">{variable}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
