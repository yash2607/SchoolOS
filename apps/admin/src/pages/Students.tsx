import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  useCreateStudent,
  useStudents,
  useUpdateStudent,
} from "@schoolos/api";
import type { Student } from "@schoolos/types";
import { PortalLayout } from "../components/PortalLayout.js";

type StudentRow = Student & {
  gradeName?: string | null;
  sectionName?: string | null;
};

type GradeOption = {
  id: string;
  label: string;
};

type SectionOption = {
  id: string;
  label: string;
  gradeId: string;
};

const BLANK_FORM = {
  firstName: "",
  lastName: "",
  gradeId: "",
  sectionId: "",
  dob: "",
  admissionDate: "",
  gender: "M" as const,
};

const STATUS_STYLES: Record<Student["status"], string> = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-200 text-slate-700",
  alumni: "bg-sky-100 text-sky-700",
  transferred: "bg-amber-100 text-amber-800",
};

const PERFORMANCE_STYLES = {
  strong: "bg-emerald-500",
  watch: "bg-amber-500",
  support: "bg-rose-500",
};

function formatDate(value: string): string {
  if (!value) return "Not available";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function gradeTag(student: StudentRow): string {
  return `${student.gradeName ?? student.gradeId} • ${student.sectionName ?? student.sectionId}`;
}

function performanceLabel(student: StudentRow): {
  label: string;
  dot: string;
} {
  if (student.status !== "active") {
    return { label: "Needs review", dot: PERFORMANCE_STYLES.support };
  }
  if (student.hasIep) {
    return { label: "Learning support", dot: PERFORMANCE_STYLES.watch };
  }
  return { label: "On track", dot: PERFORMANCE_STYLES.strong };
}

export function StudentsPage(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const studentsQuery = useStudents(
    search.trim() ? { search: search.trim() } : {}
  );
  const students = (studentsQuery.data ?? []) as StudentRow[];
  const grades = Array.from(
    new Set(students.map((student) => student.gradeName).filter(Boolean))
  ) as string[];
  const filtered = useMemo(
    () =>
      students.filter((student) =>
        gradeFilter === "all" ? true : student.gradeName === gradeFilter
      ),
    [gradeFilter, students]
  );
  const gradeOptions = useMemo<GradeOption[]>(
    () =>
      Array.from(
        new Map(
          students.map((student) => [
            student.gradeId,
            {
              id: student.gradeId,
              label: student.gradeName ?? student.gradeId,
            },
          ])
        ).values()
      ),
    [students]
  );
  const sectionOptions = useMemo<SectionOption[]>(
    () =>
      Array.from(
        new Map(
          students.map((student) => [
            student.sectionId,
            {
              id: student.sectionId,
              label: student.sectionName ?? student.sectionId,
              gradeId: student.gradeId,
            },
          ])
        ).values()
      ),
    [students]
  );
  const availableSections = useMemo(
    () =>
      sectionOptions.filter((section) =>
        form.gradeId ? section.gradeId === form.gradeId : true
      ),
    [form.gradeId, sectionOptions]
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedStudentId(null);
      return;
    }
    if (!selectedStudentId || !filtered.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedStudentId]);

  useEffect(() => {
    const firstGrade = gradeOptions[0];
    if (!form.gradeId && firstGrade) {
      setForm((current) => ({ ...current, gradeId: firstGrade.id }));
    }
  }, [form.gradeId, gradeOptions]);

  useEffect(() => {
    if (!availableSections.length) return;
    if (
      !form.sectionId ||
      !availableSections.some((section) => section.id === form.sectionId)
    ) {
      setForm((current) => ({
        ...current,
        sectionId: availableSections[0]?.id ?? "",
      }));
    }
  }, [availableSections, form.sectionId]);

  const selectedStudent =
    filtered.find((student) => student.id === selectedStudentId) ?? null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createStudent.mutateAsync({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      gradeId: form.gradeId,
      sectionId: form.sectionId,
      ...(form.dob ? { dateOfBirth: form.dob } : {}),
      ...(form.admissionDate ? { admissionDate: form.admissionDate } : {}),
    });
    setForm({ ...BLANK_FORM });
    setSelectedStudentId(created.id);
    setOpen(false);
  };

  const handleToggleSupport = async () => {
    if (!selectedStudent) return;
    await updateStudent.mutateAsync({
      id: selectedStudent.id,
      iepFlag: !selectedStudent.hasIep,
    });
  };

  const handleStatusChange = async (status: "active" | "transferred") => {
    if (!selectedStudent) return;
    await updateStudent.mutateAsync({
      id: selectedStudent.id,
      status,
    });
  };

  return (
    <PortalLayout
      portal="admin"
      title="Students"
      subtitle="A live SIS surface on top of the new SchoolOS UI foundation, ready for profile, admission, and intervention workflows."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
        <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/92 shadow-[0_24px_80px_rgba(34,41,87,0.12)] backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600">
                Student Information System
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                Enrollment, sections, and guardian context
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                This screen now uses your live student list and reshapes it into
                the premium SchoolOS management UI from the imported frontend.
              </p>
            </div>

            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">
                  Add Student
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl">
                  <Dialog.Title className="text-xl font-semibold text-slate-950">
                    Add Student
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-slate-500">
                    This form is now wired to the real student enrollment endpoint.
                  </Dialog.Description>
                  {createStudent.isError && (
                    <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      Student enrollment failed. Please verify grade and section selections.
                    </div>
                  )}
                  <form onSubmit={handleAdd} className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        First Name
                      </label>
                      <input
                        required
                        value={form.firstName}
                        onChange={(e) =>
                          setForm((current) => ({ ...current, firstName: e.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                        placeholder="Aanya"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Last Name
                      </label>
                      <input
                        required
                        value={form.lastName}
                        onChange={(e) =>
                          setForm((current) => ({ ...current, lastName: e.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                        placeholder="Sharma"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Date of Birth
                      </label>
                      <input
                        required
                        type="date"
                        value={form.dob}
                        onChange={(e) =>
                          setForm((current) => ({ ...current, dob: e.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Grade
                      </label>
                      <select
                        required
                        value={form.gradeId}
                        onChange={(e) =>
                          setForm((current) => ({ ...current, gradeId: e.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                      >
                        {gradeOptions.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Section
                      </label>
                      <select
                        required
                        value={form.sectionId}
                        onChange={(e) =>
                          setForm((current) => ({ ...current, sectionId: e.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                      >
                        {availableSections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Admission Date
                      </label>
                      <input
                        type="date"
                        value={form.admissionDate}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            admissionDate: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Gender
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            gender: e.target.value as typeof form.gender,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                      >
                        {[
                          { label: "Male", value: "M" },
                          { label: "Female", value: "F" },
                          { label: "Other", value: "Other" },
                        ].map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 md:col-span-2">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </Dialog.Close>
                      <button
                        type="submit"
                        disabled={createStudent.isPending}
                        className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
                      >
                        {createStudent.isPending ? "Saving..." : "Enroll Student"}
                      </button>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <input
                type="text"
                placeholder="Search by name or admission number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-300 md:max-w-sm"
              />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300"
              >
                <option value="all">All grades</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>{filtered.length} Learners</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{grades.length || 1} Grade Bands</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Student
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Admission ID
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Current Grade
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Enrollment
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => {
                  const performance = performanceLabel(student);
                  const isSelected = selectedStudentId === student.id;
                  return (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`cursor-pointer transition hover:bg-slate-50 ${
                        isSelected ? "bg-indigo-50/60" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-black text-white shadow-lg shadow-indigo-200">
                            {student.firstName[0]}
                            {student.lastName[0] ?? ""}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {student.fullName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {student.gender} • {student.hasIep ? "IEP active" : "General track"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                        {student.admissionNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {gradeTag(student)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(student.enrollmentDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${STATUS_STYLES[student.status]}`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${performance.dot}`}
                          />
                          <span className="text-sm font-medium text-slate-600">
                            {performance.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                      {studentsQuery.isLoading
                        ? "Loading students..."
                        : "No students found for this filter set."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,255,0.96))] shadow-[0_24px_80px_rgba(34,41,87,0.14)] backdrop-blur">
          {selectedStudent ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-200 px-7 pb-7 pt-8">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-2xl font-black text-white shadow-xl shadow-indigo-200">
                  {selectedStudent.firstName[0]}
                  {selectedStudent.lastName[0] ?? ""}
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-xl font-bold text-slate-950">
                    {selectedStudent.fullName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {gradeTag(selectedStudent)} • {selectedStudent.admissionNo}
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleToggleSupport}
                    disabled={updateStudent.isPending}
                    className="rounded-2xl bg-indigo-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {selectedStudent.hasIep ? "Clear Support" : "Enable Support"}
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedStudent.status === "active"
                          ? "transferred"
                          : "active"
                      )
                    }
                    disabled={updateStudent.isPending}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {selectedStudent.status === "active" ? "Transfer" : "Reactivate"}
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-6 px-7 py-7">
                <section>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Core Details
                  </h4>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <InfoCard label="Status" value={selectedStudent.status} />
                    <InfoCard
                      label="Gender"
                      value={selectedStudent.gender}
                    />
                    <InfoCard
                      label="Date of Birth"
                      value={formatDate(selectedStudent.dob)}
                    />
                    <InfoCard
                      label="Joined"
                      value={formatDate(selectedStudent.enrollmentDate)}
                    />
                  </div>
                </section>

                <section>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Student Support
                  </h4>
                  <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Learning Track
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {selectedStudent.hasIep ? "Supported plan" : "General curriculum"}
                        </p>
                      </div>
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          selectedStudent.hasIep ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                    <div className="mt-5 space-y-3">
                      {updateStudent.isError && (
                        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          Student update failed. Please try again.
                        </div>
                      )}
                      <MetricRow
                        label="Attendance outlook"
                        value={
                          selectedStudent.status === "active"
                            ? "Healthy"
                            : "Needs intervention"
                        }
                      />
                      <MetricRow
                        label="Guardian follow-up"
                        value={selectedStudent.hasIep ? "Recommended" : "Routine"}
                      />
                      <MetricRow
                        label="Advisory flag"
                        value={performanceLabel(selectedStudent).label}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Next Product Slices
                  </h4>
                  <div className="mt-4 space-y-3">
                    {[
                      "Editable full profile drawer with guardian records",
                      "Admission and transfer workflows with backend mutations",
                      "Student timeline for attendance, grades, and fee risk",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-8 py-12 text-center text-sm text-slate-500">
              Select a student row to open the premium profile drawer.
            </div>
          )}
        </aside>
      </div>
    </PortalLayout>
  );
}

function InfoCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {props.label}
      </div>
      <div className="mt-2 text-sm font-semibold capitalize text-slate-800">
        {props.value}
      </div>
    </div>
  );
}

function MetricRow(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {props.label}
      </span>
      <span className="text-sm font-semibold text-slate-700">{props.value}</span>
    </div>
  );
}
