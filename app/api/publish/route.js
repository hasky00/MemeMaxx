import { put, list } from "@vercel/blob"

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get("file")
  const top = formData.get("top") || ""
  const bottom = formData.get("bottom") || ""

  const filename = `memes/${Date.now()}.png`
  const blob = await put(filename, file, { access: "public" })

  // Store metadata as a small JSON blob
  const meta = { url: blob.url, top, bottom, createdAt: new Date().toISOString() }
  await put(`meta/${Date.now()}.json`, JSON.stringify(meta), { access: "public", contentType: "application/json" })

  return Response.json({ url: blob.url })
}

export async function GET() {
  const { blobs } = await list({ prefix: "meta/" })
  const metas = await Promise.all(
    blobs.map(async (b) => {
      const res = await fetch(b.url)
      return res.json()
    })
  )
  return Response.json({ memes: metas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) })
}