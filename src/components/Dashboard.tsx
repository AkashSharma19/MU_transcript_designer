import { Plus, Calendar, X, Check } from 'lucide-react';
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

export default function Dashboard({ templates, onCreate, onEdit, onUpdateTemplateMeta }: DashboardProps) {
    const PROGRAM_OPTIONS = ["PGP TBM", "PGP Rise", "UG Programme", "Masters Union", "Executive MBA"];
    const COHORT_OPTIONS = ["Class of 2023", "Class of 2024", "Class of 2025", "Class of 2026", "Cohort 1", "Cohort 2"];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Transcript Designs</h1>
                        <p className="text-gray-500 mt-1">Manage, map, and customize your transcript templates</p>
                    </div>
                    <button
                        onClick={onCreate}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        <span>Create New Design</span>
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                        Template Name
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
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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
                                                    options={COHORT_OPTIONS}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
