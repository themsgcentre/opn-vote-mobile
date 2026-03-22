export async function postJson<T>(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as any
  if (!res.ok) throw new Error(`POST ${url} [${res.status}]: ${JSON.stringify(json)}`)
  if (json.error) throw new Error(`POST ${url} API error: ${JSON.stringify(json.error)}`)
  return json.data as T
}