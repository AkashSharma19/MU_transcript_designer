import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TranscriptTemplate, TranscriptData } from './types';
import Dashboard from './components/Dashboard';
import TranscriptEditor from './components/TranscriptEditor';

// Mock initial templates (or empty list)
const SAMPLE_TEMPLATES: TranscriptTemplate[] = [];

function App() {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [templates, setTemplates] = useState<TranscriptTemplate[]>(SAMPLE_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  // Load from localStorage on mount (optional persistence)
  useEffect(() => {
    const saved = localStorage.getItem('transcript_templates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  }, []);

  // Save to localStorage whenever templates change
  useEffect(() => {
    localStorage.setItem('transcript_templates', JSON.stringify(templates));
  }, [templates]);

  const handleCreateNew = () => {
    setActiveTemplateId(null);
    setView('editor');
  };

  const handleEdit = (id: string) => {
    setActiveTemplateId(id);
    setView('editor');
  };

  const handleSave = (name: string, data: TranscriptData) => {
    if (activeTemplateId) {
      // Update existing
      setTemplates(prev => prev.map(t =>
        t.id === activeTemplateId
          ? { ...t, name, data, lastModified: new Date().toISOString() }
          : t
      ));
    } else {
      // Create new
      const newTemplate: TranscriptTemplate = {
        id: uuidv4(),
        name,
        lastModified: new Date().toISOString(),
        programs: [],
        cohorts: [],
        data
      };
      setTemplates(prev => [...prev, newTemplate]);
      setActiveTemplateId(newTemplate.id);
    }
  };

  const handleUpdateTemplateMeta = (id: string, updates: Partial<TranscriptTemplate>) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  return (
    <div className="h-screen w-screen bg-gray-100 font-sans text-gray-900">
      {view === 'dashboard' ? (
        <Dashboard
          templates={templates}
          onCreate={handleCreateNew}
          onEdit={handleEdit}
          onUpdateTemplateMeta={handleUpdateTemplateMeta}
        />
      ) : (
        <TranscriptEditor
          initialData={activeTemplate?.data}
          templateName={activeTemplate?.name}
          onBack={() => setView('dashboard')}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default App;
