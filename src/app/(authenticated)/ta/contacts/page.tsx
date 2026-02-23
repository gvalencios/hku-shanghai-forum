"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { getAllContactPersons, createContactPerson, updateContactPerson, deleteContactPerson } from "@/lib/firestore/contact-persons";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { ContactPerson } from "@/lib/types/report";

export default function TAContactsPage() {
  const { uid } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContactPerson | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    getAllContactPersons().then((data) => {
      setContacts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openForm = (contact?: ContactPerson) => {
    if (contact) {
      setEditing(contact);
      setName(contact.name);
      setRole(contact.role);
      setPhone(contact.phone);
      setEmail(contact.email);
      setArea(contact.responsibilityArea);
    } else {
      setEditing(null);
      setName("");
      setRole("");
      setPhone("");
      setEmail("");
      setArea("");
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, role, phone, email, responsibilityArea: area, createdBy: uid ?? "" };
      if (editing) {
        await updateContactPerson(editing.id, data);
        toast("Contact updated");
      } else {
        await createContactPerson(data);
        toast("Contact created");
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
    await deleteContactPerson(id);
    toast("Contact deleted");
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
            Contact Persons
          </h1>
          <p className="mt-1 text-[15px] text-[#6E6E73]">
            Manage emergency and reference contacts
          </p>
        </div>
        <Button onClick={() => openForm()}>Add Contact</Button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          description="Add contact persons that can be linked to reports."
          action={<Button onClick={() => openForm()}>Add Contact</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-4">
                {/* Header: avatar + name/role + actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10 text-[15px] font-semibold text-[#007AFF]">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[#1D1D1F]">{c.name}</p>
                      {c.role && (
                        <p className="text-[12px] text-[#86868B]">
                          <span className="font-medium uppercase tracking-wide">Role</span>
                          {" · "}{c.role}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openForm(c)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-[#FF3B30]" onClick={() => handleDelete(c.id)}>Delete</Button>
                  </div>
                </div>

                {/* Area */}
                {c.responsibilityArea && (
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#F5F5F7] px-2 py-0.5 text-[11px] text-[#6E6E73]">
                      <span className="font-semibold uppercase tracking-wide">Area</span>
                      <span>·</span>
                      <span>{c.responsibilityArea}</span>
                    </span>
                  </div>
                )}

                {/* Contact details */}
                {(c.phone || c.email) && (
                  <div className="mt-3 space-y-1.5 border-t border-[#F5F5F7] pt-3">
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#86868B]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <span className="text-[13px] text-[#1D1D1F]">{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#86868B]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span className="text-[13px] text-[#1D1D1F]">{c.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Contact" : "New Contact"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Role / Title" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Local Guide" />
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Responsibility Area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Transportation, Medical" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
