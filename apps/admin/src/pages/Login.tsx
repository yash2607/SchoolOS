import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: [PHASE-1] Connect to auth service
    void navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">SchoolOS</h1>
          <p className="text-text-secondary text-sm">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="admin@school.edu"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-900 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
