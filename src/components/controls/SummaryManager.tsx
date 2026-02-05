import { useTranscript } from '../../context/TranscriptContext';

export default function SummaryManager() {
    const { data, toggleSummarySectionVisibility, toggleSummaryField, updateSummaryFieldLabel } = useTranscript();
    const { summaryConfig } = data;

    return (
        <div className="space-y-4">
            {summaryConfig.sections.map(section => (
                <div key={section.id} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    {/* Header / Visibility Toggle */}
                    <div className="p-3 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={section.isVisible}
                                onChange={() => toggleSummarySectionVisibility(section.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                id={`toggle-${section.id}`}
                            />
                            <label htmlFor={`toggle-${section.id}`} className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                                {section.type} Table
                            </label>
                        </div>
                    </div>

                    {/* Inner Controls (only if visible) */}
                    {section.isVisible && (
                        <div className="p-4 border-t border-gray-200">
                            <div className="space-y-4">
                                {/* Credits Required */}
                                <ToggleWithLabel
                                    label="Credits Required"
                                    checked={section.showCreditsRequired}
                                    onToggle={() => toggleSummaryField(section.id, 'showCreditsRequired')}
                                    textValue={section.creditsRequiredLabel}
                                    onTextChange={(val) => updateSummaryFieldLabel(section.id, 'creditsRequiredLabel', val)}
                                />

                                {/* Credits Awarded */}
                                <ToggleWithLabel
                                    label="Credits Awarded"
                                    checked={section.showCreditsAwarded}
                                    onToggle={() => toggleSummaryField(section.id, 'showCreditsAwarded')}
                                    textValue={section.creditsAwardedLabel}
                                    onTextChange={(val) => updateSummaryFieldLabel(section.id, 'creditsAwardedLabel', val)}
                                />

                                {/* CGPA */}
                                <ToggleWithLabel
                                    label="CGPA"
                                    checked={section.showCGPA}
                                    onToggle={() => toggleSummaryField(section.id, 'showCGPA')}
                                    textValue={section.cgpaLabel}
                                    onTextChange={(val) => updateSummaryFieldLabel(section.id, 'cgpaLabel', val)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <p className="text-xs text-gray-500 italic mt-2">
                Enable a table to customize its contents.
            </p>
        </div>
    );
}

function ToggleWithLabel({
    label,
    checked,
    onToggle,
    textValue,
    onTextChange
}: {
    label: string,
    checked: boolean,
    onToggle: () => void,
    textValue: string,
    onTextChange: (val: string) => void
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <button
                    onClick={onToggle}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                    <span
                        className={`${checked ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>

            {checked && (
                <div className="ml-1 pl-2 border-l-2 border-gray-200">
                    <label className="block text-xs text-gray-500 mb-1">Display Label</label>
                    <input
                        type="text"
                        value={textValue}
                        onChange={(e) => onTextChange(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-1.5 border"
                    />
                </div>
            )}
        </div>
    )
}
