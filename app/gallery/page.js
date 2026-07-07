"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function Gallery() {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/publish")
      .then(r => r.json())
      .then(d => { setMemes(d.memes || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-px">
        <div className="bg-zinc-950 px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">🖼️ MemeMaxx Gallery</h1>
            <p className="text-zinc-400 text-xs mt-0.5">All the memes, publicly shared</p>
          </div>
          <Link href="/" className="text-sm text-yellow-400 font-bold border border-yellow-500/40 px-3 py-1.5 rounded-lg hover:bg-yellow-500/10 transition-all">
            🔥 Create
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 mt-2">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-zinc-500 animate-pulse">Loading memes...</p>
          </div>
        ) : memes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-6xl">🏜️</div>
            <p className="text-zinc-500">No memes yet — be the first!</p>
            <Link href="/" className="bg-yellow-500 text-black font-black px-6 py-2.5 rounded-lg text-sm">Create one →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {memes.map((m, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-yellow-500/40 transition-all">
                <div className="relative aspect-video">
                  <Image src={m.url} alt={m.top || "meme"} fill className="object-cover" />
                </div>
                {(m.top || m.bottom) && (
                  <div className="p-2">
                    {m.top && <p className="text-xs text-zinc-300 font-bold truncate">{m.top}</p>}
                    {m.bottom && <p className="text-xs text-zinc-500 truncate">{m.bottom}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}