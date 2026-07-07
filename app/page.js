"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"

const FONTS = ["Impact", "Arial Black", "Oswald", "Anton", "Comic Sans MS"]

function MemeCanvas({ image, topText, bottomText, font, fontSize, textColor, strokeColor, onReady }) {
  const canvasRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    const ctx = canvas.getContext("2d")
    const img = new window.Image()
    img.onload = () => {
      const maxW = 640
      const scale = Math.min(1, maxW / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const size = parseInt(fontSize) * (canvas.width / 600)
      ctx.font = `900 ${size}px ${font}`
      ctx.fillStyle = textColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = size * 0.12
      ctx.lineJoin = "round"
      ctx.textAlign = "center"

      const wrapText = (text) => {
        const words = text.toUpperCase().split(" ")
        const lines = []
        let cur = ""
        for (const w of words) {
          const test = cur ? cur + " " + w : w
          if (ctx.measureText(test).width > canvas.width * 0.9 && cur) { lines.push(cur); cur = w }
          else cur = test
        }
        if (cur) lines.push(cur)
        return lines
      }

      if (topText) {
        const lines = wrapText(topText)
        lines.forEach((line, i) => {
          const y = size * 1.1 + i * size * 1.2
          ctx.strokeText(line, canvas.width / 2, y)
          ctx.fillText(line, canvas.width / 2, y)
        })
      }

      if (bottomText) {
        const lines = wrapText(bottomText)
        const totalH = lines.length * size * 1.2
        lines.forEach((line, i) => {
          const y = canvas.height - totalH + i * size * 1.2 - size * 0.1
          ctx.strokeText(line, canvas.width / 2, y)
          ctx.fillText(line, canvas.width / 2, y)
        })
      }

      if (onReady) onReady(canvas)
    }
    img.src = image
  }, [image, topText, bottomText, font, fontSize, textColor, strokeColor, onReady])

  useEffect(() => { draw() }, [draw])
  return <canvas ref={canvasRef} className="rounded-xl shadow-2xl max-w-full w-full" />
}

export default function Home() {
  const [image, setImage] = useState(null)
  const [topText, setTopText] = useState("")
  const [bottomText, setBottomText] = useState("")
  const [font, setFont] = useState("Impact")
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState("#FFFFFF")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [activeTab, setActiveTab] = useState("manual")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState("")
  const canvasRef = useRef(null)
  const fileRef = useRef(null)

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  const askAI = async () => {
    if (!aiPrompt.trim()) return
    setAiSuggestion([])
    setAiLoading(true)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      })
      const data = await res.json()
      setAiSuggestions(data.suggestions || [])
    } catch { setAiSuggestions([{ top: "AI WENT OFFLINE", bottom: "LIKE MY SOCIAL LIFE", vibe: "cursed" }]) }
    setAiLoading(false)
  }

  const publishMeme = async () => {
    if (!canvasRef.current || !image) return
    setPublishing(true)
    setPublished(false)
    try {
      const blob = await new Promise(res => canvasRef.current.toBlob(res, "image/png"))
      const formData = new FormData()
      formData.append("file", blob, "meme.png")
      formData.append("top", topText)
      formData.append("bottom", bottomText)
      const res = await fetch("/api/publish", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) { setPublishedUrl(data.url); setPublished(true) }
    } catch (e) { console.error(e) }
    setPublishing(false)
  }

  const downloadMeme = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "meme-maxx.png"
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  const vibeColors = {
    savage: "border-red-500/40 text-red-300",
    wholesome: "border-pink-500/40 text-pink-300",
    relatable: "border-blue-500/40 text-blue-300",
    cursed: "border-purple-500/40 text-purple-300",
    based: "border-emerald-500/40 text-emerald-300",
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-px">
        <div className="bg-zinc-950 px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">🔥 MemeMaxx</h1>
            <p className="text-zinc-400 text-xs mt-0.5">AI-powered meme generator</p>
          </div>
          <Link href="/gallery" className="text-sm text-yellow-400 font-bold border border-yellow-500/40 px-3 py-1.5 rounded-lg hover:bg-yellow-500/10 transition-all">
            🖼️ Gallery
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div className="space-y-4">
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-zinc-700 hover:border-yellow-500 rounded-xl p-6 text-center cursor-pointer transition-all">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <div className="text-4xl mb-2">{image ? "🖼️" : "📤"}</div>
            <p className="text-zinc-400 text-sm">{image ? "Tap to change image" : "Tap to upload image"}</p>
          </div>

          <div className="flex bg-zinc-900 rounded-xl p-1 gap-1">
            {["manual", "ai"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? "bg-yellow-500 text-black" : "text-zinc-400 hover:text-white"}`}>
                {tab === "ai" ? "✨ AI Generate" : "✏️ Manual"}
              </button>
            ))}
          </div>

          {activeTab === "manual" ? (
            <div className="space-y-3">
              <input value={topText} onChange={e => setTopText(e.target.value)} placeholder="TOP TEXT"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 text-sm" />
              <input value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder="BOTTOM TEXT"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={font} onChange={e => setFont(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500">
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Size</span>
                  <input type="range" min="24" max="100" value={fontSize} onChange={e => setFontSize(e.target.value)} className="flex-1 accent-yellow-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-zinc-400 block mb-1">Text</label>
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer" /></div>
                <div><label className="text-xs text-zinc-400 block mb-1">Outline</label>
                  <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer" /></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                placeholder="Describe your meme idea..." rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 text-sm resize-none" />
              <button onClick={askAI} disabled={aiLoading || !aiPrompt.trim()}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black py-3 rounded-lg disabled:opacity-40 text-sm">
                {aiLoading ? "✨ Thinking..." : "✨ Generate Captions"}
              </button>
              {aiSuggestions.map((s, i) => (
                <button key={i} onClick={() => { setTopText(s.top); setBottomText(s.bottom); setActiveTab("manual") }}
                  className={`w-full text-left bg-zinc-900 border rounded-lg p-3 hover:bg-zinc-800 transition-all ${vibeColors[s.vibe] || "border-zinc-700"}`}>
                  <span className="text-xs opacity-60">{s.vibe}</span>
                  <p className="text-xs mt-1">TOP: <span className="text-white font-bold">{s.top}</span></p>
                  <p className="text-xs">BOT: <span className="text-white font-bold">{s.bottom}</span></p>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={downloadMeme} disabled={!image}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-30 text-sm">
              💾 Download
            </button>
            <button onClick={publishMeme} disabled={!image || publishing}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black py-3 rounded-lg disabled:opacity-40 text-sm">
              {publishing ? "Uploading..." : "🌍 Publish"}
            </button>
          </div>

          {published && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
              <p className="text-emerald-400 font-bold text-sm">🎉 Published to gallery!</p>
              <a href={publishedUrl} target="_blank" className="text-xs text-emerald-300 underline mt-1 block break-all">{publishedUrl}</a>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Preview</p>
          {image ? (
            <MemeCanvas image={image} topText={topText} bottomText={bottomText}
              font={font} fontSize={fontSize} textColor={textColor} strokeColor={strokeColor}
              onReady={(canvas) => { canvasRef.current = canvas }} />
          ) : (
            <div className="w-full aspect-video bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
              <div className="text-center"><div className="text-5xl mb-3">🔥</div>
                <p className="text-zinc-600 text-sm">Upload an image to start</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
