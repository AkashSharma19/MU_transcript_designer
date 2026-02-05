import { ArrowLeft, Save } from 'lucide-react';
import { TranscriptProvider, useTranscript } from '../context/TranscriptContext';
import Sidebar from './Sidebar';
import Preview from './Preview';
import type { TranscriptData } from '../types';
import { useState } from 'react';

interface TranscriptEditorProps {
    initialData?: TranscriptData;
    templateName?: string;
    onBack: () => void;
    onSave: (name: string, data: TranscriptData) => void;
}

function EditorContent({ onBack, onSave, defaultName }: {
    onBack: () => void,
    onSave: (name: string, data: TranscriptData) => void,
    defaultName: string
}) {
    const { data } = useTranscript();
    const [name, setName] = useState(defaultName);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleSave = async () => {
        if (!name.trim()) {
            alert("Please enter a template name");
            return;
        }
        setSaveStatus('saving');
        await onSave(name, data);
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
            {/* Top Bar */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Template Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-sm font-semibold text-gray-800 outline-none border-b border-transparent focus:border-indigo-500 transition-colors bg-transparent placeholder-gray-300"
                            placeholder="Untitled Design"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${saveStatus === 'saved'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                >
                    <Save size={16} className={saveStatus === 'saving' ? 'animate-spin' : ''} />
                    <span>
                        {saveStatus === 'saving' ? 'Saving...' :
                            saveStatus === 'saved' ? 'Saved!' : 'Save Template'}
                    </span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar className="w-1/3 min-w-[350px] max-w-[450px] border-r border-gray-200 bg-white h-full overflow-y-auto" />
                <div className="flex-1 h-full overflow-y-auto p-8 flex justify-center bg-gray-100">
                    <Preview />
                </div>
            </div>
        </div>
    );
}

export default function TranscriptEditor({ initialData, templateName, onBack, onSave }: TranscriptEditorProps) {
    return (
        <TranscriptProvider initialData={initialData}>
            <EditorContent
                onBack={onBack}
                onSave={onSave}
                defaultName={templateName || "Untitled Template"}
            />
        </TranscriptProvider>
    );
}
