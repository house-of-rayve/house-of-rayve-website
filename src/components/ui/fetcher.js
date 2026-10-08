// Small JSON fetch helper for client components. Throws with the API's error message.
export async function api(url, { method = "GET", body, ...rest } = {}) {
  const res = await fetch(url, {
    method,
    headers: body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : undefined,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    ...rest,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}
