export async function querySubgraph<T>(subgraphUrl: string, query: string): Promise<T> {
  const res = await fetch(subgraphUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const json = (await res.json()) as any
  if (!res.ok || json.errors) {
    throw new Error(`Subgraph error: ${JSON.stringify(json.errors ?? json)}`)
  }
  return json.data as T
}