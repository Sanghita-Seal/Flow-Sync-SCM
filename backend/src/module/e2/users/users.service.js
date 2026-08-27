import https from "https";

const CLERK_SECRET = process.env.CLERK_SECRET;
const CLERK_HOST = "api.clerk.com";

function clerkRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: CLERK_HOST,
      path: `/v1${path}`,
      method,
      headers: {
        Authorization: `Bearer ${CLERK_SECRET}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Clerk API error: ${res.statusCode} - ${data}`));
        } else {
          resolve(JSON.parse(data));
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

export async function listUsers() {
  if (!CLERK_SECRET) throw new Error("CLERK_SECRET is not set");
  const data = await clerkRequest("GET", "/users?limit=100");
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
  const data = await clerkRequest("PATCH", `/users/${userId}`, {
    public_metadata: { role },
  });
  return {
    id: data.id,
    role: data.public_metadata?.role || "user",
  };
}
