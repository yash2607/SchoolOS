import { useState } from "react";
import { PortalLayout } from "../components/PortalLayout.js";
import * as Dialog from "@radix-ui/react-dialog";

interface Teacher {
  id: string;
  name: string;
  phone: string;
  role: "CLASS_TEACHER" | "SUBJECT_TEACHER" | "ACADEMIC_COORD";
  subject: string;
  classes: string;
  status: "active" | "inactive";
}

const MOCK_TEACHERS: Teacher[] = [
  { id: "1", name: "Sunita Sharma", phone: "+91 98765 43210", role: "CLASS_TEACHER", subject: "Mathematics", classes: "10-A, 10-B", status: "active" },
  { id: "2", name: "Rajesh Patel", phone: "+91 87654 32109", role: "SUBJECT_TEACHER", subject: "Physics", classes: "11-A, 11-B, 12-A", status: "active" },
  { id: "3", name: "Meena Iyer", phone: "+91 76543 21098", role: "ACADEMIC_COORD", subject: "English", classes: "All", status: "active" },
  { id: "4", name: "Arun Nair", phone: "+91 65432 10987", role: "SUBJECT_TEACHER", subject: "Chemistry", classes: "11-A, 12-A", status: "active" },
  { id: "5", name: "Pooja Verma", phone: "+91 54321 09876", role: "CLASS_TEACHER", subject: "Biology", classes: "9-A", status: "active" },
  { id: "6", name: "Suresh Reddy", phone: "+91 43210 98765", role: "SUBJECT_TEACHER", subject: "History", classes: "8-A, 8-B, 9-A", status: "inactive" },
  { id: "7", name: "Anjali Mehta", phone: "+91 32109 87654", role: "CLASS_TEACHER", subject: "Geography", classes: "7-A", status: "active" },
  { id: "8", name: "Vikram Singh", phone: "+91 21098 76543", role: "SUBJECT_TEACHER", subject: "Computer Science", classes: "9-A, 9-B, 10-A", status: "active" },
];

const ROLE_BADGE: Record<Teacher["role"], string> = {
  CLASS_TEACHER: "bg-blue-100 text-[#2E7DD1]",
  SUBJECT_TEACHER: "bg-purple-100 text-purple-700",
  ACADEMIC_COORD: "bg-[#1B3A6B]/10 text-[#1B3A6B]",
};

const ROLE_LABEL: Record<Teacher["role"], string> = {
  CLASS_TEACHER: "Class Teacher",
  SUBJECT_TEACHER: "Subject Teacher",
  ACADEMIC_COORD: "Academic Coord",
};

const BLANK_FORM = { name: "", phone: "", role: "SUBJECT_TEACHER" as Teacher["role"], subject: "" };

export function TeachersPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t: Teacher = {
      id: Date.now().toString(),
      ...form,
      classes: "TBD",
      status: "active",
    };
    setTeachers((prev) => [t, ...prev]);
    setForm({ ...BLANK_FORM });
    setOpen(false);
  };

  return (
    <PortalLayout
      portal="admin"
      title="Teachers"
      subtitle="Teacher roster, roles, and staffing for the MVP admin workspace."
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by name or subject…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2E7DD1] focus:ring-2 focus:ring-[#2E7DD1]/20" />
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E7DD1] transition">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Teacher
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
              <Dialog.Title className="mb-1 text-lg font-semibold text-[#1A1A2E]">Add Teacher</Dialog.Title>
              <Dialog.Description className="mb-5 text-sm text-[#4A4A6A]">Fill in the teacher details below.</Dialog.Description>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]" placeholder="e.g. Sunita Sharma" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Phone Number</label>
                  <input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Teacher["role"] }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]">
                    <option value="SUBJECT_TEACHER">Subject Teacher</option>
                    <option value="CLASS_TEACHER">Class Teacher</option>
                    <option value="ACADEMIC_COORD">Academic Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Subject</label>
                  <input required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]" placeholder="e.g. Mathematics" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button type="button" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4A4A6A] hover:bg-gray-50">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" className="rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E7DD1]">Add Teacher</button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm text-[#4A4A6A]">{filtered.length} teacher{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-[#4A4A6A]">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Classes</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[#1A1A2E]">{t.name}</td>
                  <td className="px-5 py-3.5 text-[#4A4A6A]">{t.phone}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[t.role]}`}>{ROLE_LABEL[t.role]}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[#4A4A6A]">{t.subject}</td>
                  <td className="px-5 py-3.5 text-[#4A4A6A]">{t.classes}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.status === "active" ? "bg-green-100 text-[#1A7A4A]" : "bg-gray-100 text-[#4A4A6A]"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs text-[#2E7DD1] hover:underline mr-3">Edit</button>
                    <button className="text-xs text-[#B91C1C] hover:underline">Deactivate</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-[#4A4A6A]">No teachers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
}
