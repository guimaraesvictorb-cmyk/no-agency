"use client"

import { useState } from "react"
import { Upload, Search, Images, Trash2, Copy, Image } from "lucide-react"
import { mockMediaFiles } from "@/lib/mock-data"
import { formatFileSize, formatDate } from "@/lib/utils"
import type { MediaFile } from "@/lib/types"

export default function PastaDeMidiasPage() {
  const [files, setFiles] = useState(mockMediaFiles)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<MediaFile | null>(null)

  const filtered = files.filter(
    (f) =>
      f.file_name.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-[40px] text-white leading-none mb-1">Pasta de Mídias</h1>
          <p className="text-[13px] text-stone">{files.length} arquivo{files.length !== 1 ? "s" : ""} enviados</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-white"
          style={{ background: "var(--signal)" }}>
          <Upload size={13} />
          Upload
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou tag..."
          className="w-full pl-10 pr-4 py-3 text-[13px] text-white placeholder:text-stone/40 rounded-lg outline-none focus:border-signal transition-colors"
          style={{ background: "var(--ink-2)", border: "1px solid var(--border)" }}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone">
          <Images size={40} className="mb-3 opacity-20" />
          <p className="text-[13px]">Nenhum arquivo encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelected(file)}
              className="group relative rounded-xl overflow-hidden text-left transition-all"
              style={{
                border: selected?.id === file.id ? "1px solid var(--signal)" : "1px solid var(--border)",
              }}
            >
              <div className="aspect-square" style={{ background: "var(--ink-3)" }}>
                {file.file_type.startsWith("image/") ? (
                  <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={24} className="text-stone" />
                  </div>
                )}
              </div>
              <div className="p-2" style={{ background: "var(--ink-2)" }}>
                <div className="text-[11px] text-white truncate">{file.file_name}</div>
                <div className="text-[10px] text-stone">{formatFileSize(file.file_size)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,10,10,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelected(null)}>
          <div className="rounded-2xl p-6 max-w-sm w-full"
            style={{ background: "var(--ink-2)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-semibold text-white">Detalhes do Arquivo</div>
              <button onClick={() => setSelected(null)} className="text-stone hover:text-white text-xl leading-none">×</button>
            </div>
            <img src={selected.file_url} alt={selected.file_name} className="w-full aspect-square object-cover rounded-xl mb-4" />
            <div className="space-y-2.5">
              {[
                { label: "Nome", value: selected.file_name },
                { label: "Tamanho", value: formatFileSize(selected.file_size) },
                { label: "Data", value: formatDate(selected.uploaded_at) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[12px] text-stone">{row.label}</span>
                  <span className="text-[12px] text-white text-right max-w-[200px] truncate">{row.value}</span>
                </div>
              ))}
              {selected.tags.length > 0 && (
                <div>
                  <span className="text-[12px] text-stone block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {selected.tags.map((t) => (
                      <span key={t} className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: "var(--ink-3)", border: "1px solid var(--border)", color: "var(--stone)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold text-white transition-colors"
                style={{ background: "var(--ink-3)", border: "1px solid var(--border)" }}>
                <Copy size={12} />
                Copiar URL
              </button>
              <button
                onClick={() => { setFiles((prev) => prev.filter((f) => f.id !== selected.id)); setSelected(null) }}
                className="p-2.5 rounded-lg transition-colors"
                style={{ background: "rgba(214,64,69,0.1)", border: "1px solid rgba(214,64,69,0.3)", color: "var(--signal)" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
