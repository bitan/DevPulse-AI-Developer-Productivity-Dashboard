import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, X, Trash2 } from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  tags: string[];
  status: "active" | "paused" | "completed";
}

const STORAGE_KEY = "devpulse_projects";

const defaultProjects: Project[] = [
  { id: 1, name: "DevPulse Dashboard", description: "Developer productivity analytics platform", progress: 72, tags: ["React", "TypeScript", "Supabase"], status: "active" },
  { id: 2, name: "ML Pipeline",        description: "Automated machine learning data pipeline",    progress: 45, tags: ["Python", "Docker", "TensorFlow"],   status: "active" },
  { id: 3, name: "API Gateway",        description: "Microservices API gateway with rate limiting", progress: 90, tags: ["Node.js", "Redis", "Kubernetes"],    status: "active" },
  { id: 4, name: "Mobile App",         description: "Cross-platform mobile companion app",          progress: 20, tags: ["React Native", "Firebase"],          status: "paused" },
  { id: 5, name: "CLI Tool",           description: "Developer workflow automation CLI",             progress: 100, tags: ["Rust", "GitHub Actions"],           status: "completed" },
];

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Project[];
  } catch { /* corrupt storage */ }
  return defaultProjects;
}

function saveProjects(projects: Project[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch { /* ignore */ }
}

// Distinct visual treatment for each status
const statusStyles: Record<Project["status"], string> = {
  active:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  paused:    "bg-amber-500/10   text-amber-600   dark:text-amber-400",
  completed: "bg-primary/10     text-primary",
};

// Progress bar color per status
const progressStyles: Record<Project["status"], string> = {
  active:    "bg-primary",
  paused:    "bg-amber-500",
  completed: "bg-emerald-500",
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", description: "", tags: "", status: "active" as Project["status"], progress: "0" });

  // Persist whenever projects change
  useEffect(() => { saveProjects(projects); }, [projects]);

  const openAdd = () => {
    setEditProject(null);
    setForm({ name: "", description: "", tags: "", status: "active", progress: "0" });
    setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setForm({ name: p.name, description: p.description, tags: p.tags.join(", "), status: p.status, progress: String(p.progress) });
    setShowModal(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const progress = Math.min(100, Math.max(0, Number(form.progress) || 0));

    if (editProject) {
      setProjects((prev) => prev.map((p) =>
        p.id === editProject.id ? { ...p, name: form.name.trim(), description: form.description.trim(), tags, status: form.status, progress } : p
      ));
    } else {
      setProjects((prev) => [...prev, { id: Date.now(), name: form.name.trim(), description: form.description.trim(), progress, tags, status: form.status }]);
    }
    setShowModal(false);
  };

  const deleteProject = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setShowModal(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Project
          </button>
        </div>

        {projects.length === 0 && (
          <div className="card-surface p-12 text-center text-sm text-muted-foreground">
            No projects yet. Click <strong>New Project</strong> to add one.
          </div>
        )}

        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card-surface p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openEdit(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openEdit(project)}
              aria-label={`Edit project: ${project.name}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusStyles[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-4 shrink-0">{project.progress}%</span>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressStyles[project.status]}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editProject ? "Edit project" : "New project"}
          onClick={() => setShowModal(false)}
        >
          <div className="card-surface p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">{editProject ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setShowModal(false)} aria-label="Close modal" className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="proj-name" className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
                <input
                  id="proj-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Project name"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="proj-desc" className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <input
                  id="proj-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label htmlFor="proj-tags" className="text-xs font-medium text-muted-foreground mb-1 block">Tags (comma separated)</label>
                <input
                  id="proj-tags"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="React, TypeScript, Docker"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="proj-status" className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <select
                    id="proj-status"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Project["status"] }))}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="proj-progress" className="text-xs font-medium text-muted-foreground mb-1 block">Progress (0–100)</label>
                  <input
                    id="proj-progress"
                    type="number"
                    min="0"
                    max="100"
                    value={form.progress}
                    onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={save}
                disabled={!form.name.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editProject ? "Save Changes" : "Create Project"}
              </button>
              {editProject && (
                <button
                  onClick={() => deleteProject(editProject.id)}
                  aria-label="Delete project"
                  className="p-2.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
