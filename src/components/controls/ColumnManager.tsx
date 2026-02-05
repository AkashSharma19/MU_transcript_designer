import { useTranscript } from '../../context/TranscriptContext';

interface ColumnManagerProps {
    tableType: 'inClass' | 'outClass';
}

export default function ColumnManager({ tableType }: ColumnManagerProps) {
    const { data, toggleColumn, updateColumnLabel, updateTableFormat } = useTranscript();
    const config = data.tableConfigs[tableType];

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                    {data.isUnifiedTables && tableType === 'inClass'
                        ? 'Unified'
                        : (tableType === 'inClass' ? 'InClass' : 'OutClass')} Columns
                </h3>

                {/* Format Selector */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <label className="text-xs text-gray-500 block mb-2">Table Layout</label>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => updateTableFormat(tableType, 'grid')}
                            className={`flex-1 py-1.5 px-2 text-xs border rounded-md text-center transition-colors ${config.format === 'grid'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Grid (Term-wise)
                        </button>
                        <button
                            onClick={() => updateTableFormat(tableType, 'list')}
                            className={`flex-1 py-1.5 px-2 text-xs border rounded-md text-center transition-colors ${config.format === 'list'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            List (Consolidated)
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Toggle
                        label="Credits"
                        checked={config.showCredits}
                        onChange={() => toggleColumn(tableType, 'showCredits')}
                        inputValue={config.creditsLabel || "Credits"}
                        onInputChange={(val) => updateColumnLabel(tableType, 'creditsLabel', val)}
                    />
                    <Toggle
                        label="Grade"
                        checked={config.showGrade}
                        onChange={() => toggleColumn(tableType, 'showGrade')}
                        inputValue={config.gradeLabel || "Grade"}
                        onInputChange={(val) => updateColumnLabel(tableType, 'gradeLabel', val)}
                    />
                    <Toggle
                        label="GPA"
                        checked={config.showGPA}
                        onChange={() => toggleColumn(tableType, 'showGPA')}
                        inputValue={config.gpaLabel || "GPA"}
                        onInputChange={(val) => updateColumnLabel(tableType, 'gpaLabel', val)}
                    />
                    <Toggle
                        label="Percentage"
                        checked={config.showPercentage}
                        onChange={() => toggleColumn(tableType, 'showPercentage')}
                        inputValue={config.percentageLabel || "Percentage"}
                        onInputChange={(val) => updateColumnLabel(tableType, 'percentageLabel', val)}
                    />
                    <Toggle
                        label="Course Type"
                        checked={config.showCourseType}
                        onChange={() => toggleColumn(tableType, 'showCourseType')}
                        inputValue={config.courseTypeLabel || "Type"}
                        onInputChange={(val) => updateColumnLabel(tableType, 'courseTypeLabel', val)}
                    />
                </div>
            </div>
            <p className="text-xs text-gray-500 italic">
                "Course Name" is always visible.
            </p>
        </div >
    );
}

function Toggle({ label, checked, onChange, inputValue, onInputChange }: {
    label: string,
    checked: boolean,
    onChange: () => void,
    inputValue?: string,
    onInputChange?: (val: string) => void
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
                <span className="text-xs text-gray-500 block mb-1">{label} Column</span>
                {onInputChange && (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-1 border"
                        placeholder={`Label for ${label}`}
                    />
                )}
                {!onInputChange && <span className="text-sm text-gray-700">{label}</span>}
            </div>
            <button
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200'} flex-shrink-0`}
            >
                <span
                    className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>
    )
}
