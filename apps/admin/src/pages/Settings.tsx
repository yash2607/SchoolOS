import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Layout } from "../components/Layout.js";
import { useAuthStore } from "../store/authStore.js";

type UserRole = "SUPER_ADMIN" | "SCHOOL_ADMIN" | "ACADEMIC_COORD" | "CLASS_TEACHER" | "SUBJECT_TEACHER" | "PARENT";

interface SystemUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  status: "active" | "inactive";
}

const MOCK_USERS: SystemUser[] = [
  { id: "1", name: "Rajiv Anand", phone: "+91 98765 43210", role: "SUPER_ADMIN", status: "active" },
  { id: "2", name: "Sunita Sharma", phone: "+91 87654 32109", role: "SCHOOL_ADMIN", status: "active" },
  { id: "3", name: "Meena Iyer", phone: "+91 76543 21098", role: "ACADEMIC_COORD", status: "active" },
  { id: "4", name: "Arun Nair", phone: "+91 65432 10987", role: "CLASS_TEACHER", status: "active" },
  { id: "5", name: "Pooja Verma", phone: "+91 54321 09876", role: "SUBJECT_TEACHER", status: "inactive" },
];

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  SCHOOL_ADMIN: "bg-[#1B3A6B]/10 text-[#1B3A6B]",
  ACADEMIC_COORD: "bg-purple-100 text-purple-700",
  CLASS_TEACHER: "bg-blue-100 text-[#2E7DD1]",
  SUBJECT_TEACHER: "bg-green-100 text-[#1A7A4A]",
  PARENT: "bg-gray-100 text-[#4A4A6A]",
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "SCHOOL_ADMIN", label: "School Admin" },
  { value: "ACADEMIC_COORD", label: "Academic Coordinator" },
  { value: "CLASS_TEACHER", label: "Class Teacher" },
  { value: "SUBJECT_TEACHER", label: "Subject Teacher" },
  { value: "PARENT", label: "Parent" },
];

export function SettingsPage(): React.JSX.Element {
  const { user } = useAuthStore();
  const [users, setUsers] = useState(MOCK_USERS);
  const [invite, setInvite] = useState({ phone: "", role: "CLASS_TEACHER" as UserRole });
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [school, setSchool] = useState({
    name: user?.schoolName ?? "Demo School",
    timezone: "Asia/Kolkata",
    logoUrl: "",
  });
  const [schoolSaved, setSchoolSaved] = useState(false);

  const handleRoleChange = (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u))
    );
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: SystemUser = {
      id: Date.now().toString(),
      name: "New User",
      phone: invite.phone,
      role: invite.role,
      status: "active",
    };
    setUsers((prev) => [...prev, newUser]);
    setInvite({ phone: "", role: "CLASS_TEACHER" });
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolSaved(true);
    setTimeout(() => setSchoolSaved(false), 2000);
  };

  return (
    <Layout title="Settings">
      <Tabs.Root defaultValue="school">
        <Tabs.List className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
          {[
            { value: "school", label: "School Profile" },
            { value: "roles", label: "Role Management" },
            { value: "invite", label: "Invite User" },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#4A4A6A] transition data-[state=active]:bg-white data-[state=active]:text-[#1A1A2E] data-[state=active]:shadow-sm"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* School Profile */}
        <Tabs.Content value="school">
          <div className="max-w-lg rounded-xl bg-white border border-gray-100 shadow-sm p-6">
            <h3 className="mb-1 font-semibold text-[#1A1A2E]">School Profile</h3>
            <p className="mb-5 text-sm text-[#4A4A6A]">Update your school's basic information.</p>
            <form onSubmit={handleSaveSchool} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">School Name</label>
                <input value={school.name} onChange={(e) => setSchool((s) => ({ ...s, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1] focus:ring-2 focus:ring-[#2E7DD1]/20" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Timezone</label>
                <select value={school.timezone} onChange={(e) => setSchool((s) => ({ ...s, timezone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Logo URL</label>
                <input value={school.logoUrl} onChange={(e) => setSchool((s) => ({ ...s, logoUrl: e.target.value }))}
                  placeholder="https://yourschool.com/logo.png"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1] focus:ring-2 focus:ring-[#2E7DD1]/20" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E7DD1] transition">
                  Save Changes
                </button>
                {schoolSaved && <span className="text-sm text-[#1A7A4A] font-medium">✓ Saved!</span>}
              </div>
            </form>
          </div>
        </Tabs.Content>

        {/* Role Management */}
        <Tabs.Content value="roles">
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-[#1A1A2E]">Role Management</h3>
              <p className="text-sm text-[#4A4A6A]">Manage user roles and access levels.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-[#4A4A6A]">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-[#1A1A2E]">{u.name}</td>
                      <td className="px-5 py-3.5 text-[#4A4A6A]">{u.phone}</td>
                      <td className="px-5 py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 outline-none cursor-pointer ${ROLE_COLORS[u.role]}`}
                        >
                          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.status === "active" ? "bg-green-100 text-[#1A7A4A]" : "bg-gray-100 text-[#4A4A6A]"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleToggleStatus(u.id)}
                          className={`text-xs hover:underline ${u.status === "active" ? "text-[#B91C1C]" : "text-[#1A7A4A]"}`}>
                          {u.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tabs.Content>

        {/* Invite User */}
        <Tabs.Content value="invite">
          <div className="max-w-lg rounded-xl bg-white border border-gray-100 shadow-sm p-6">
            <h3 className="mb-1 font-semibold text-[#1A1A2E]">Invite User</h3>
            <p className="mb-5 text-sm text-[#4A4A6A]">Send an OTP invitation to a new user's phone number.</p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Phone Number</label>
                <div className="flex overflow-hidden rounded-lg border border-gray-200 focus-within:border-[#2E7DD1] focus-within:ring-2 focus-within:ring-[#2E7DD1]/20">
                  <span className="flex items-center bg-gray-50 px-3 text-sm text-[#4A4A6A] border-r border-gray-200">+91</span>
                  <input required value={invite.phone} onChange={(e) => setInvite((i) => ({ ...i, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="9876543210" maxLength={10}
                    className="flex-1 px-3 py-3 text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1A1A2E]">Assign Role</label>
                <select value={invite.role} onChange={(e) => setInvite((i) => ({ ...i, role: e.target.value as UserRole }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#2E7DD1]">
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {inviteSuccess && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-[#1A7A4A]">
                  ✓ User invited successfully! They can now log in with their phone number.
                </div>
              )}
              <button type="submit" className="w-full rounded-lg bg-[#1B3A6B] py-3 text-sm font-semibold text-white hover:bg-[#2E7DD1] transition">
                Send Invitation
              </button>
            </form>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </Layout>
  );
}
