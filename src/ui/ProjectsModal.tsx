import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Plus,
  FolderOpen,
  Trash2,
  Clock,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Watch,
  Check,
  Download,
  Upload,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProjectData } from '../types';
import {
  listProjects,
  deleteProject,
  duplicateProject,
  exportProjectArchive,
  importProjectArchive,
} from '../storage/db';
import { getEngineInstance } from '../engine/engineInstance';

export const ProjectsModal: React.FC = () => {
  const {
    project: currentProject,
    isProjectsModalOpen,
    setProjectsModalOpen,
    createNewProject,
    loadSavedProject,
  } = useStore();

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isProjectsModalOpen) {
      loadList();
    }
  }, [isProjectsModalOpen]);

  const loadList = async () => {
    const list = await listProjects();
    setProjects(list);
  };

  if (!isProjectsModalOpen) return null;

  const handleSelect = async (id: string) => {
    await loadSavedProject(id);
    const engine = getEngineInstance();
    if (engine) {
      const updated = useStore.getState().project;
      engine.updateSceneType(updated.sceneType);
      engine.updateDeviceType(updated.deviceType);
      engine.updateChassisColor(updated.chassisColor);
      if (updated.chassisFinish) {
        engine.updateChassisFinish(updated.chassisFinish);
      }
      engine.updateLighting(updated.lightingPreset);
      engine.updateBackground(updated.background);
      engine.setDuration(updated.duration);
      if (updated.renderSettings) {
        engine.updateRenderSettings(updated.renderSettings);
      }
      if (updated.zoomFocus) {
        engine.setZoomFocus(updated.zoomFocus.x, updated.zoomFocus.y);
      }
      await engine.setScreenAsset(updated.primaryAsset, false);
      if (updated.screenTransform) {
        engine.updateScreenTransform(updated.screenTransform, false);
      }
      if (updated.secondaryAsset) {
        await engine.setScreenAsset(updated.secondaryAsset, true);
        if (updated.secondaryScreenTransform) {
          engine.updateScreenTransform(updated.secondaryScreenTransform, true);
        }
      }
    }
    setProjectsModalOpen(false);
  };

  const handleCreate = async () => {
    const name = newProjectName.trim() || 'New Showcase Project';
    const client = newClientName.trim() || 'Client';
    const newProj = await createNewProject(name, client);
    const engine = getEngineInstance();
    if (engine) {
      engine.updateSceneType(newProj.sceneType);
      engine.updateDeviceType(newProj.deviceType);
      engine.updateChassisColor(newProj.chassisColor);
      if (newProj.chassisFinish) {
        engine.updateChassisFinish(newProj.chassisFinish);
      }
      engine.updateLighting(newProj.lightingPreset);
      engine.updateBackground(newProj.background);
      engine.setDuration(newProj.duration);
      if (newProj.renderSettings) {
        engine.updateRenderSettings(newProj.renderSettings);
      }
      await engine.setScreenAsset(null, false);
      await engine.setScreenAsset(null, true);
    }
    setNewProjectName('');
    setNewClientName('');
    setIsCreating(false);
    setProjectsModalOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      await loadList();
    }
  };

  const handleExportArchive = async (e: React.MouseEvent, p: ProjectData) => {
    e.stopPropagation();
    try {
      const blob = await exportProjectArchive(p);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${p.name.toLowerCase().replace(/\s+/g, '-')}-backup.showcase`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export project archive: ' + err.message);
    }
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    try {
      const restored = await importProjectArchive(file);
      await loadList();
      await handleSelect(restored.id);
    } catch (err: any) {
      setImportError('Failed to import archive: ' + err.message);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await duplicateProject(id, ' (Salinan)');
      await loadList();
    } catch (err: any) {
      alert('Gagal menduplikasi proyek: ' + err.message);
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-purple-400" />;
      case 'desktop':
        return <Monitor className="w-4 h-4 text-cyan-400" />;
      case 'smartwatch':
        return <Watch className="w-4 h-4 text-amber-400" />;
      default:
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
            Approved
          </span>
        );
      case 'revision_requested':
        return (
          <span className="text-[9px] bg-rose-500/20 text-rose-400 font-bold px-1.5 py-0.2 rounded border border-rose-500/30">
            Revision
          </span>
        );
      case 'in_review':
        return (
          <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
            In Review
          </span>
        );
      default:
        return (
          <span className="text-[9px] bg-zinc-800 text-zinc-400 font-medium px-1.5 py-0.2 rounded">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Saved Client Projects
            </h2>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
              IndexedDB
            </span>
          </div>
          <button
            onClick={() => setProjectsModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Top Actions: Create + Import */}
          <div className="flex items-center gap-2">
            <input
              ref={importFileInputRef}
              type="file"
              accept=".showcase,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
              }}
            />

            {!isCreating && (
              <>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-zinc-700 hover:border-blue-500 text-xs font-semibold text-zinc-300 hover:text-blue-400 bg-zinc-950/40 hover:bg-zinc-950/80 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Project</span>
                </button>

                <button
                  onClick={() => importFileInputRef.current?.click()}
                  title="Restore a .showcase project archive from backup"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-800 hover:border-indigo-500/60 text-xs font-semibold text-zinc-300 hover:text-indigo-300 bg-zinc-950/40 hover:bg-zinc-950/80 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import .showcase</span>
                </button>
              </>
            )}
          </div>

          {importError && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {importError}
            </div>
          )}

          {/* Create new project form */}
          {isCreating && (
            <div className="bg-zinc-950 p-3 rounded-xl border border-blue-500/60 space-y-2">
              <div className="text-xs font-semibold text-zinc-200">
                New Project Details
              </div>
              <input
                type="text"
                placeholder="Project Name (e.g. Acme Mobile App)"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Client Name (e.g. Acme Corp)"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-3.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                >
                  Create & Open
                </button>
              </div>
            </div>
          )}

          {/* Project list */}
          <div className="space-y-2">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No saved projects yet. Current project is saved automatically.
              </div>
            ) : (
              projects.map((p) => {
                const isCurrent = p.id === currentProject.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-blue-950/30 border-blue-500/60 text-white'
                        : 'bg-zinc-950/50 border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${
                          isCurrent ? 'bg-blue-600/20' : 'bg-zinc-800'
                        }`}
                      >
                        {getDeviceIcon(p.deviceType)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">
                            {p.name}
                          </span>
                          {getStatusBadge(p.status)}
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                          {p.clientName && (
                            <>
                              <span className="text-zinc-400 font-medium">
                                {p.clientName}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span className="capitalize">{p.sceneType}</span>
                          <span>•</span>
                          <span className="font-mono">{p.aspectRatio}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(p.updatedAt || p.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isCurrent && (
                        <Check className="w-4 h-4 text-blue-400 mr-1" />
                      )}

                      {/* Export backup archive */}
                      <button
                        onClick={(e) => handleExportArchive(e, p)}
                        title="Export Backup Archive (.showcase)"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors"
                      >
                        <FileArchive className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate project */}
                      <button
                        onClick={(e) => handleDuplicate(e, p.id)}
                        title="Duplikasi Proyek (Clone)"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-300 hover:bg-blue-950/40 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {projects.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(e, p.id)}
                          title="Delete Project"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/50 text-[11px] text-zinc-500 flex justify-between items-center">
          <span>💡 .showcase files can be moved between computers</span>
          <button
            onClick={() => setProjectsModalOpen(false)}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
