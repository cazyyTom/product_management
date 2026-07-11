/**
 * NotesPage.jsx  (Step 6)
 *
 * Sticky-notes-style grid for a project's notes.
 * Features:
 *  - Masonry-style responsive grid of NoteCards
 *  - Click card → NoteViewer (read) → NoteEditor (edit)
 *  - "+ New Note" → NoteEditor (create)
 *  - Search / filter by author
 *  - Delete with confirm dialog
 */

import { useState, useMemo, useCallback } from "react";
import { useParams, Link }  from "react-router-dom";
import { useSetPageTitle }  from "@/hooks/usePageTitle";
import { useFetch }         from "@/hooks/useFetch";
import { getProjectNotes, deleteNote } from "@/api/notes.api";
import { getProjectById }   from "@/api/projects.api";

import { NoteCard }    from "@/components/notes/NoteCard";
import { NoteEditor }  from "@/components/notes/NoteEditor";
import { NoteViewer }  from "@/components/notes/NoteViewer";
import { EmptyState }  from "@/components/ui/EmptyState";
import { Spinner }     from "@/components/ui/Spinner";
import { Alert }       from "@/components/ui/Alert";

export default function NotesPage() {
  const { projectId } = useParams();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data: projData } = useFetch(() => getProjectById(projectId), [projectId]);
  const projectName = projData?.project?.name ?? projData?.name ?? "Project";
  useSetPageTitle(`${projectName} — Notes`);

  const {
    data: notesData, isLoading, error, refetch,
  } = useFetch(() => getProjectNotes(projectId), [projectId]);
  const notes = useMemo(
    () => notesData?.notes ?? (Array.isArray(notesData) ? notesData : []),
    [notesData],
  );

  // ── UI state ───────────────────────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [filterAuthor, setFilterAuthor] = useState("all");

  // Modal state: null = closed, object = which note
  const [viewNote, setViewNote]     = useState(null); // NoteViewer
  const [editNote, setEditNote]     = useState(null); // NoteEditor (null title = new)
  const [editOpen, setEditOpen]     = useState(false);
  const [viewOpen, setViewOpen]     = useState(false);

  // ── Unique authors for filter dropdown ─────────────────────────────────────
  const authors = useMemo(() => {
    const seen = new Map();
    notes.forEach((n) => {
      if (n.createdBy) seen.set(n.createdBy._id, n.createdBy.username);
    });
    return [...seen.entries()].map(([id, username]) => ({ id, username }));
  }, [notes]);

  // ── Filtered notes ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return notes.filter((n) => {
      if (filterAuthor !== "all" && n.createdBy?._id !== filterAuthor) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (n.title ?? "").toLowerCase().includes(q) ||
          (n.content ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [notes, filterAuthor, search]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditNote(null);
    setEditOpen(true);
  };

  const openView = (note) => {
    setViewNote(note);
    setViewOpen(true);
  };

  const openEdit = (note) => {
    setViewOpen(false);
    setEditNote(note);
    setEditOpen(true);
  };

  const handleSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(async (noteId) => {
    await deleteNote(projectId, noteId);
    refetch();
  }, [projectId, refetch]);

  const handleDeleteFromCard = useCallback((note) => handleDelete(note._id), [handleDelete]);
  const handleDeleteFromViewer = useCallback(() => handleDelete(viewNote?._id), [handleDelete, viewNote]);

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/projects" className="hover:text-gray-600 transition-colors">Projects</Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-gray-600 transition-colors">
          {projectName}
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Notes</span>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary shrink-0">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New note
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      {notes.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 w-52"
            />
          </div>

          {authors.length > 1 && (
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className="input w-44"
            >
              <option value="all">All authors</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.username}</option>
              ))}
            </select>
          )}

          {(search || filterAuthor !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilterAuthor("all"); }}
              className="btn-ghost btn-sm"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-brand-500" />
        </div>
      )}

      {!isLoading && error && <Alert variant="error" message={error} />}

      {!isLoading && !error && notes.length === 0 && (
        <EmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="No notes yet"
          message="Capture ideas, decisions, and meeting notes for this project."
          action={
            <button onClick={openCreate} className="btn-primary">
              Write your first note
            </button>
          }
        />
      )}

      {!isLoading && filtered.length === 0 && notes.length > 0 && (
        <p className="text-sm text-gray-400">No notes match your search.</p>
      )}

      {/* Notes grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filtered.map((note) => (
            <div key={note._id} className="break-inside-avoid">
              <NoteCard
                note={note}
                onClick={() => openView(note)}
                onDelete={() => handleDeleteFromCard(note)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <NoteViewer
        open={viewOpen}
        note={viewNote}
        onClose={() => setViewOpen(false)}
        onEdit={() => openEdit(viewNote)}
        onDelete={handleDeleteFromViewer}
      />

      <NoteEditor
        open={editOpen}
        projectId={projectId}
        note={editNote}
        onClose={() => { setEditOpen(false); setEditNote(null); }}
        onSaved={(saved) => {
          handleSaved();
          // If editing, update the viewNote so viewer shows fresh content
          if (editNote) {
            setViewNote(saved);
            setViewOpen(true);
          }
          setEditOpen(false);
        }}
      />
    </div>
  );
}
