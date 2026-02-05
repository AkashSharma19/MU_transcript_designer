import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TranscriptTemplate, TranscriptData } from './types';
import Dashboard from './components/Dashboard';
import TranscriptEditor from './components/TranscriptEditor';

// Mock initial templates (or empty list)
const SAMPLE_TEMPLATES: TranscriptTemplate[] = [];

function App() {
  const [view, setView] = useState<'dashboard' | 'editor'>(() => {
    return (localStorage.getItem('transcript_app_view') as 'dashboard' | 'editor') || 'dashboard';
  });
  const [templates, setTemplates] = useState<TranscriptTemplate[]>(() => {
    const saved = localStorage.getItem('transcript_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
    return SAMPLE_TEMPLATES;
  });
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(() => {
    return localStorage.getItem('transcript_active_template_id');
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('transcript_templates', JSON.stringify(templates));
    localStorage.setItem('transcript_app_view', view);
    if (activeTemplateId) {
      localStorage.setItem('transcript_active_template_id', activeTemplateId);
    } else {
      localStorage.removeItem('transcript_active_template_id');
    }
  }, [templates, view, activeTemplateId]);

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
        types: ['transcript'],
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
    setTemplates(prev => {
      // If we are updating cohorts, we need to ensure exclusivity
      if (updates.cohorts) {
        const newCohorts = updates.cohorts;
        return prev.map(t => {
          // If it's the template being updated, apply the updates
          if (t.id === id) {
            return { ...t, ...updates };
          }
          // For other templates, remove any cohorts that are now newly claimed by the target template
          const filteredCohorts = t.cohorts.filter(c => !newCohorts.includes(c));

          // Only return a new object if changes were actually made
          if (filteredCohorts.length !== t.cohorts.length) {
            return { ...t, cohorts: filteredCohorts };
          }
          return t;
        });
      }

      // Standard update for other fields (programs, names, etc.)
      return prev.map(t =>
        t.id === id ? { ...t, ...updates } : t
      );
    });
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
