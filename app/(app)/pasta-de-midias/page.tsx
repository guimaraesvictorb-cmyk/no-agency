"use client"

import { useState } from "react"
import { Upload, Search, Images, Trash2, Copy, Image } from "lucide-react"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
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
          <h2 className="text-lg font-semibold text-cream">Pasta de Mídias</h2>
          <p className="text-sm text-stone">{files.length} arquivo{files.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm">
          <Upload size={14} />
          Upload
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou tag..."
          className="w-full bg-ink-2 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-cream placeholder:text-stone focus:outline-none focus:border-stone"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone">
          <Images size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum arquivo encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelected(file)}
              className={`group relative rounded-xl overflow-hidden border transition-all ${
                selected?.id === file.id ? "border-signal" : "border-border hover:border-stone/40"
              }`}
            >
              <div className="aspect-square bg-ink-3">
                {file.file_type.startsWith("image/") ? (
                  <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={24} className="text-stone" />
                  </div>
                )}
              </div>
              <div className="p-2 bg-ink-2">
                <div className="text-[11px] text-cream truncate">{file.file_name}</div>
                <div className="text-[10px] text-stone">{formatFileSize(file.file_size)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-ink-2 border border-border rounded-2xl p-6 max-w-sm w-full shadow-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-cream">Detalhes do Arquivo</h3>
              <button onClick={() => setSelected(null)} className="text-stone hover:text-cream text-lg">×</button>
            </div>
            <img src={selected.file_url} alt={selected.file_name} className="w-full aspect-square object-cover rounded-xl mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone">Nome</span>
                <span className="text-cream text-right max-w-[200px] truncate">{selected.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Tamanho</span>
                <span className="text-cream">{formatFileSize(selected.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Data</span>
                <span className="text-cream">{formatDate(selected.uploaded_at)}</span>
              </div>
              {selected.tags.length > 0 && (
                <div>
                  <span className="text-stone block mb-1.5">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {selected.tags.map((t) => (
                      <span key={t} className="bg-ink-3 border border-border text-xs text-stone px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" size="sm" className="flex-1">
                <Copy size={12} />
                Copiar URL
              </Button>
              <Button variant="danger" size="sm" onClick={() => {
                setFiles((prev) => prev.filter((f) => f.id !== selected.id))
                setSelected(null)
              }}>
                <Trash2 size={12} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
