const CLERK_SECRET = process.env.CLERK_SECRET;
const CLERK_API = "https://api.clerk.com/v1";

function headers() {
  return {
    Authorization: `Bearer ${CLERK_SECRET}`,
    "Content-Type": "application/json",
  };
}

export async function listUsers() {
  const res = await fetch(`${CLERK_API}/users?limit=100`, { headers: headers() });
  if (!res.ok) throw new Error(`Clerk API error: ${res.status}`);
  const data = await res.json();
  return data.data.map((u) => ({
    id: u.id,
    email: u.email_addresses?.[0]?.email_address || "",
    firstName: u.first_name || "",
    lastName: u.last_name || "",
    role: u.public_metadata?.role || "user",
    createdAt: u.created_at,
  }));
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${CLERK_API}/users/${userId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ public_metadata: { role } }),
  });
  if (!res.ok) throw new Error(`Clerk API error: ${res.status}`);
  const data = await res.json();
  return {
    id: data.id,
    role: data.public_metadata?.role || "user",
  };
}
