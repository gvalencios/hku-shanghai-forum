"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  getAllInfoBlocks,
  createInfoBlock,
  updateInfoBlock,
  deleteInfoBlock,
  reorderInfoBlocks,
} from "@/lib/firestore/info-blocks";
import { getInfoCategories, saveInfoCategories } from "@/lib/firestore/info-categories";
import { type InfoCategory, type InfoBlock, type InfoCategoryDef } from "@/lib/types/info";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export default function TAInfoPage() {
  const { uid } = useAuth();
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<InfoBlock[]>([]);
  const [categories, setCategories] = useState<InfoCategoryDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InfoBlock | null>(null);
  const [filter, setFilter] = useState<InfoCategory | "all">("all");

  // Block form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<InfoCategory>("");
  const [isPublished, setIsPublished] = useState(true);
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Manage sections state
  const [showSections, setShowSections] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [savingSections, setSavingSections] = useState(false);

  const loadData = useCallback(async () => {
    const [data, cats] = await Promise.all([getAllInfoBlocks(), getInfoCategories()]);
    setBlocks(data);
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryLabel = (id: string) =>
    categories.find((c) => c.id === id)?.label ?? id;

  const openForm = (block?: InfoBlock) => {
    const defaultCat = categories[0]?.id ?? "";
    if (block) {
      setEditing(block);
      setTitle(block.title);
      setBody(block.body);
      setCategory(block.category);
      setIsPublished(block.isPublished);
      setLinks(block.links.length > 0 ? block.links : []);
    } else {
      setEditing(null);
      setTitle("");
      setBody("");
      setCategory(filter !== "all" ? filter : defaultCat);
      setIsPublished(true);
      setLinks([]);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const filteredLinks = links.filter((l) => l.label.trim() || l.url.trim());
    const now = new Date().toISOString();
    try {
      if (editing) {
        await updateInfoBlock(editing.id, { title, body, category, isPublished, links: filteredLinks });
        toast("Block updated");
      } else {
        await createInfoBlock({
          title,
          body,
          category,
          order: blocks.length,
          links: filteredLinks,
          isPublished,
          createdAt: now,
          updatedAt: now,
          createdBy: uid ?? "",
        });
        toast("Block created");
      }
      setShowForm(false);
      loadData();
    } catch {
      toast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteInfoBlock(id);
    toast("Block deleted");
    loadData();
  };

  const reorderFiltered = async (newFiltered: InfoBlock[], items: InfoBlock[]) => {
    const filteredIds = new Set(items.map((b) => b.id));
    let fi = 0;
    const allIds = blocks.map((b) => filteredIds.has(b.id) ? newFiltered[fi++].id : b.id);
    await reorderInfoBlocks(allIds);
    loadData();
  };

  const handleMoveUp = async (index: number, items: InfoBlock[]) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    await reorderFiltered(next, items);
  };

  const handleMoveDown = async (index: number, items: InfoBlock[]) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    await reorderFiltered(next, items);
  };

  // ── Manage sections ──
  const handleAddSection = async () => {
    const label = newSectionLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (categories.some((c) => c.id === id)) {
      toast("A section with that name already exists", "error");
      return;
    }
    setSavingSections(true);
    try {
      const updated = [...categories, { id, label }];
      await saveInfoCategories(updated);
      setCategories(updated);
      setNewSectionLabel("");
      toast("Section added");
    } catch {
      toast("Failed to add section", "error");
    } finally {
      setSavingSections(false);
    }
  };

  const handleRemoveSection = async (cat: InfoCategoryDef) => {
    const hasBlocks = blocks.some((b) => b.category === cat.id);
    if (hasBlocks) {
      toast("Remove all blocks in this section first", "error");
      return;
    }
    setSavingSections(true);
    try {
      const updated = categories.filter((c) => c.id !== cat.id);
      await saveInfoCategories(updated);
      setCategories(updated);
      if (filter === cat.id) setFilter("all");
      toast("Section removed");
    } catch {
      toast("Failed to remove section", "error");
    } finally {
      setSavingSections(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.label }));

  const filterTabs = [
    { id: "all", label: "All", count: blocks.length },
    ...categories.map((c) => ({
      id: c.id,
      label: c.label,
      count: blocks.filter((b) => b.category === c.id).length,
    })),
  ];

  const filtered = filter === "all" ? blocks : blocks.filter((b) => b.category === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
            Information Hub
          </h1>
          <p className="mt-1 text-[15px] text-[#6E6E73]">
            Manage info blocks visible to students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowSections(true)}>
            Manage Sections
          </Button>
          <Button onClick={() => openForm()}>Add Block</Button>
        </div>
      </div>

      <div className="mb-4">
        <Tabs tabs={filterTabs} activeTab={filter} onChange={(id) => setFilter(id)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No info blocks"
          description={
            filter === "all"
              ? "Create information blocks for students to browse."
              : `No blocks in ${categoryLabel(filter)} yet.`
          }
          action={<Button onClick={() => openForm()}>Create Block</Button>}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((block, index) => (
            <Card key={block.id}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Badge variant={block.isPublished ? "success" : "default"} className="normal-case tracking-normal">
                        {block.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Badge className="normal-case tracking-normal">{categoryLabel(block.category)}</Badge>
                    </div>
                    <p className="text-[14px] font-semibold text-[#1D1D1F]">
                      {block.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[12px] text-[#86868B]">
                      {block.body}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    {filter !== "all" && (
                      <>
                        <button
                          onClick={() => handleMoveUp(index, filtered)}
                          disabled={index === 0}
                          className="rounded p-1 text-[#86868B] hover:bg-[#F5F5F7] disabled:opacity-30"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveDown(index, filtered)}
                          disabled={index === filtered.length - 1}
                          className="rounded p-1 text-[#86868B] hover:bg-[#F5F5F7] disabled:opacity-30"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openForm(block)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-[#FF3B30]" onClick={() => handleDelete(block.id)}>Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Block form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Block" : "New Block"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label="Body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[150px]" required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2 text-[14px] text-[#1D1D1F]">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D2D2D7] text-[#007AFF]"
                />
                Published
              </label>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-[#1D1D1F]">Links</p>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => {
                      const next = [...links];
                      next[i] = { ...next[i], label: e.target.value };
                      setLinks(next);
                    }}
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => {
                      const next = [...links];
                      next[i] = { ...next[i], url: e.target.value };
                      setLinks(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setLinks(links.filter((_, j) => j !== i))}
                    className="flex-shrink-0 rounded p-1 text-[#86868B] hover:text-[#FF3B30]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLinks([...links, { label: "", url: "" }])}
                className="text-[13px] font-medium text-[#007AFF] hover:underline"
              >
                + Add link
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      {/* Manage sections modal */}
      <Modal open={showSections} onClose={() => setShowSections(false)} title="Manage Sections">
        <div className="space-y-3">
          {categories.map((cat) => {
            const count = blocks.filter((b) => b.category === cat.id).length;
            return (
              <div key={cat.id} className="flex items-center justify-between rounded-xl border border-[#E8E8ED] px-3 py-2.5">
                <div>
                  <p className="text-[14px] font-medium text-[#1D1D1F]">{cat.label}</p>
                  <p className="text-[12px] text-[#86868B]">{count} block{count !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => handleRemoveSection(cat)}
                  disabled={savingSections}
                  className="rounded p-1 text-[#86868B] hover:text-[#FF3B30] disabled:opacity-40"
                  title={count > 0 ? "Remove all blocks first" : "Remove section"}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}

          <div className="border-t border-[#F5F5F7] pt-3">
            <p className="mb-2 text-[13px] font-medium text-[#6E6E73]">Add new section</p>
            <div className="flex gap-2">
              <Input
                placeholder="Section name"
                value={newSectionLabel}
                onChange={(e) => setNewSectionLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSection(); } }}
              />
              <Button onClick={handleAddSection} loading={savingSections} disabled={!newSectionLabel.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
