import { useState, useEffect } from "react";
import PageWrapper from "../../components/layout/PageWrapper";
import apiClient from "../../api/apiClient";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    apiClient
      .get("/api/users")
      .then((res) => setUsers(res.data.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId, newRole) {
    setUpdating(userId);
    try {
      await apiClient.patch(`/api/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <PageWrapper
      title="User Management"
      description="View and manage user roles."
    >
      {loading ? (
        <div className="text-sm text-slate-500 py-8 text-center">Loading users...</div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-left">
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Name</th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Email</th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Role</th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${
                          u.role === "manager"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === "manager" ? (
                        <button
                          onClick={() => handleRoleChange(u.id, "user")}
                          disabled={updating === u.id}
                          className="text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-50"
                        >
                          {updating === u.id ? "Updating..." : "Downgrade to User"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(u.id, "manager")}
                          disabled={updating === u.id}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                        >
                          {updating === u.id ? "Updating..." : "Upgrade to Manager"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  );
}
