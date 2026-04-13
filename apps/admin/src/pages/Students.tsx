import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useStudents } from "@schoolos/api";
import type { Student } from "@schoolos/types";
import { PortalLayout } from "../components/PortalLayout.js";

type StudentRow = Student & {
  gradeName?: string | null;
  sectionName?: string | null;
};

const STATUS_BADGE: Record<Student["status"] | "transferred", string> = {
  active: "bg-green-100 text-[#1A7A4A]",
  inactive: "bg-gray-100 text-[#4A4A6A]",
  alumni: "bg-blue-100 text-[#2E7DD1]",
  transferred: "bg-amber-100 text-[#D97706]",
};

const BLANK_FORM = {
  name: "",
  admissionNo: "",
  grade: "",
  section: "",
  dob: "",
  gender: "Male" as const,
};

export function StudentsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const studentsQuery = useStudents(
    search.trim() ? { search: search.trim() } : {}
  );
  const students = (studentsQuery.data ?? []) as StudentRow[];
  const grades = Array.from(
    new Set(students.map((student) => student.gradeName).filter(Boolean))
  ) as string[];
  const filtered = students.filter((student) =>
    gradeFilter === "all" ? true : student.gradeName === gradeFilter
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setForm({ ...BLANK_FORM });
    setOpen(false);
  };

  return (
    <PortalLayout
      portal="admin"
      title="Students"
      subtitle="Enrollment, search, and profile management for the student information system."
    >
      {/* Header actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or admission no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2E7DD1] focus:ring-2 focus:ring-[#2E7DD1]/20"
            />
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2E7DD1] sm:w-auto"
          >
            <option value="all">All Grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E7DD1] transition">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Student
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
              <Dialog.Title className="mb-1 text-lg font-semibold text-[#1A1A2E]">Add Student</Dialog.Title>
              <Dialog.Description className="mb-5 text-sm text-[#4A4A6A]">
                SIS create/edit wiring is the next backend slice. This dialog is ready for that handoff.
              </Dialog.Description>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Full Name</label>
                    <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]" placeholder="e.g. Rahul Singh" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Admission No.</label>
                    <input required value={form.admissionNo} onChange={(e) => setForm((f) => ({ ...f, admissionNo: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]" placeholder="2024010" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Date of Birth</label>
                    <input required type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Grade</label>
                    <input required value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]" placeholder="Grade 6" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Section</label>
                    <input required value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]" placeholder="A" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as typeof form.gender }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]">
                      {["Male","Female","Other"].map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button type="button" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4A4A6A] hover:bg-gray-50">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" className="rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E7DD1]">Save Draft</button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm text-[#4A4A6A]">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-[#4A4A6A]">
                <th className="px-5 py-3">Admission No.</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Gender</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-[#4A4A6A]">{s.admissionNo}</td>
                  <td className="px-5 py-3.5 font-medium text-[#1A1A2E]">{s.fullName}</td>
                  <td className="px-5 py-3.5 text-[#4A4A6A]">
                    {s.gradeName ?? s.gradeId} / {s.sectionName ?? s.sectionId}
                  </td>
                  <td className="px-5 py-3.5 capitalize text-[#4A4A6A]">{s.gender}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs text-[#2E7DD1] hover:underline mr-3">View</button>
                    <button className="text-xs text-[#4A4A6A] hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#4A4A6A]">
                    {studentsQuery.isLoading ? "Loading students..." : "No students found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
}
