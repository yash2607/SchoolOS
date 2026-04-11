import { useState } from "react";
import { Layout } from "../components/Layout.js";
import * as Dialog from "@radix-ui/react-dialog";

interface Student {
  id: string;
  admissionNo: string;
  name: string;
  grade: string;
  section: string;
  status: "active" | "inactive" | "alumni";
  dob: string;
  gender: "Male" | "Female" | "Other";
}

const MOCK_STUDENTS: Student[] = [
  { id: "1", admissionNo: "2024001", name: "Aarav Sharma", grade: "10", section: "A", status: "active", dob: "2009-03-15", gender: "Male" },
  { id: "2", admissionNo: "2024002", name: "Priya Patel", grade: "10", section: "B", status: "active", dob: "2009-07-22", gender: "Female" },
  { id: "3", admissionNo: "2024003", name: "Rohit Verma", grade: "9", section: "A", status: "active", dob: "2010-01-10", gender: "Male" },
  { id: "4", admissionNo: "2024004", name: "Ananya Singh", grade: "9", section: "B", status: "active", dob: "2010-05-18", gender: "Female" },
  { id: "5", admissionNo: "2024005", name: "Karan Mehta", grade: "8", section: "A", status: "inactive", dob: "2011-09-30", gender: "Male" },
  { id: "6", admissionNo: "2024006", name: "Shreya Gupta", grade: "8", section: "A", status: "active", dob: "2011-11-04", gender: "Female" },
  { id: "7", admissionNo: "2024007", name: "Dev Joshi", grade: "7", section: "A", status: "active", dob: "2012-02-14", gender: "Male" },
  { id: "8", admissionNo: "2023001", name: "Meera Nair", grade: "10", section: "A", status: "alumni", dob: "2008-06-20", gender: "Female" },
  { id: "9", admissionNo: "2024008", name: "Arjun Kumar", grade: "6", section: "B", status: "active", dob: "2013-08-08", gender: "Male" },
  { id: "10", admissionNo: "2024009", name: "Kavya Reddy", grade: "6", section: "A", status: "active", dob: "2013-12-25", gender: "Female" },
];

const STATUS_BADGE: Record<Student["status"], string> = {
  active: "bg-green-100 text-[#1A7A4A]",
  inactive: "bg-gray-100 text-[#4A4A6A]",
  alumni: "bg-blue-100 text-[#2E7DD1]",
};

const BLANK_FORM = { name: "", admissionNo: "", grade: "6", section: "A", dob: "", gender: "Male" as const };

export function StudentsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [students, setStudents] = useState(MOCK_STUDENTS);

  const filtered = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.admissionNo.includes(search);
    const matchesGrade = gradeFilter === "all" || s.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: Date.now().toString(),
      admissionNo: form.admissionNo,
      name: form.name,
      grade: form.grade,
      section: form.section,
      status: "active",
      dob: form.dob,
      gender: form.gender as Student["gender"],
    };
    setStudents((prev) => [newStudent, ...prev]);
    setForm({ ...BLANK_FORM });
    setOpen(false);
  };

  return (
    <Layout title="Students">
      {/* Header actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or admission no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2E7DD1] focus:ring-2 focus:ring-[#2E7DD1]/20"
            />
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2E7DD1]"
          >
            <option value="all">All Grades</option>
            {["6","7","8","9","10"].map((g) => <option key={g} value={g}>Grade {g}</option>)}
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
              <Dialog.Description className="mb-5 text-sm text-[#4A4A6A]">Fill in the student details below.</Dialog.Description>
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
                    <select value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]">
                      {["6","7","8","9","10"].map((g) => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Section</label>
                    <select value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]">
                      {["A","B","C"].map((s) => <option key={s} value={s}>Section {s}</option>)}
                    </select>
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
                  <button type="submit" className="rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E7DD1]">Add Student</button>
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
                  <td className="px-5 py-3.5 font-medium text-[#1A1A2E]">{s.name}</td>
                  <td className="px-5 py-3.5 text-[#4A4A6A]">Grade {s.grade}-{s.section}</td>
                  <td className="px-5 py-3.5 text-[#4A4A6A]">{s.gender}</td>
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
                  <td colSpan={6} className="px-5 py-10 text-center text-[#4A4A6A]">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
