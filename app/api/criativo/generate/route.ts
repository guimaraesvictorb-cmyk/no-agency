import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { brief, answers, client_id, plano, logo_urls, image_urls } = await req.json()

  const systemPrompt = `Você é a NOVA — Diretora Criativa de IA da No Agency.
Você transforma o DNA de uma marca em criativos de alta performance para redes sociais.
Você pensa como diretora de criação de agência premium: estratégia primeiro, execução cirúrgica.
NUNCA use clichês como "No mundo atual" ou "Em tempos de mudança".
Escreva em português brasileiro natural e direto.
O gancho (1ª linha) deve parar o scroll em menos de 2 segundos.
Responda APENAS com JSON válido, sem markdown, sem explicações fora do JSON.`

  const variacoes = plano === "starter" ? 1 : plano === "growth" ? 2 : 3
  const numPosts = parseInt(String(answers.volume ?? "12")) || 12

  const userPrompt = `Gere ${numPosts} posts para o planejamento abaixo.

=== DNA DA MARCA ===
Empresa: ${brief?.company_name ?? "—"}
Segmento: ${brief?.segment ?? "—"}
Cidade: ${brief?.city ?? "—"}
Diferenciais: ${brief?.differentials ?? "—"}
Cliente ideal: ${brief?.ideal_client_age ?? ""} ${brief?.ideal_client_gender ?? ""} — Dor: ${brief?.ideal_client_pain ?? ""} — Sonho: ${brief?.ideal_client_dream ?? ""}
Tom de voz: ${(brief?.tone_adjectives ?? []).join(", ")} — Evitar: ${brief?.tone_avoid ?? ""}
Exemplo de frase ideal: ${brief?.tone_example ?? ""}
Plataforma: ${brief?.platform ?? "instagram_facebook"}
Temas: ${(brief?.content_themes ?? []).join(", ")}
Notas IA: ${brief?.ai_notes ?? ""}

=== ASSETS VISUAIS DA MARCA ===
Logos (${(logo_urls as string[] ?? []).length} variações): ${(logo_urls as string[] ?? []).length > 0
  ? (logo_urls as string[]).map((u: string, i: number) => `Logo ${i + 1}: ${u}`).join("\n")
  : "Não disponível — descreva o visual do logo no briefing de design"}
Imagens reais: ${(image_urls as string[] ?? []).length > 0
  ? (image_urls as string[]).map((u: string, i: number) => `Imagem ${i + 1}: ${u}`).join("\n")
  : "Nenhuma — crie prompts detalhados para geração de imagem com IA"}

=== ENTREVISTA ===
Objetivo: ${answers.objetivo ?? "autoridade"}
Volume: ${numPosts} posts
Foco do período: ${answers.foco ?? "institucional"}
Tempo de mercado: ${answers.autoridade ?? "4_7"}
Tom da campanha: ${answers.tom ?? "humano"}
Plano: ${plano?.toUpperCase() ?? "PRO"} (${variacoes} variação${variacoes > 1 ? "ões" : ""} por post)

=== REGRAS ===
- Se houver imagens reais disponíveis nos ASSETS VISUAIS, referencie-as no campo "imagem" do design: "Usar [URL da imagem]"
- Se houver logo disponível, mencione-o no texto_criativo quando fizer sentido para a arte
- Varie os tipos: educativo, bastidores, prova_social, pergunta, autoridade, oferta, manifesto
- Cada post tem função no funil: topo (awareness), meio (consideração), fundo (decisão)
- Máximo 3 hashtags no corpo — o resto vai no comentário
- Gere exatamente ${variacoes} ${variacoes === 1 ? "variação (copy_a)" : variacoes === 2 ? "variações (copy_a, copy_b)" : "variações (copy_a, copy_b, copy_c)"}
- Datas: comece a partir de amanhã, use os dias de postagem informados
- Plataformas dos criativos: 1080x1080 feed, 1080x1920 stories${variacoes > 2 ? ", 1080x608 reels_cover" : ""}

Responda SOMENTE com este JSON (sem texto fora):
{
  "posts": [
    {
      "numero": 1,
      "tipo": "prova_social",
      "objetivo": "autoridade",
      "plataforma": "instagram_facebook",
      "data_sugerida": "2026-07-07",
      "conceito": "descrição da ideia central em 1-2 frases",
      "copy_a": {
        "headline": "gancho impactante em até 10 palavras",
        "corpo": "copy completa com parágrafos curtos e emojis estratégicos",
        "cta": "call-to-action específica",
        "hashtags_post": ["#tag1", "#tag2", "#tag3"],
        "hashtags_comentario": ["#tag4", "#tag5", "#tag6", "#tag7", "#tag8"]
      },
      "copy_b": {
        "headline": "...",
        "corpo": "...",
        "cta": "...",
        "hashtags_post": [],
        "hashtags_comentario": []
      },
      "copy_c": {
        "headline": "...",
        "corpo": "...",
        "cta": "...",
        "hashtags_post": [],
        "hashtags_comentario": []
      },
      "design": {
        "formato": "1080x1080",
        "estilo": "bold tipográfico",
        "paleta": "#0D0D0D fundo · #FFFFFF texto · #C9A84C destaque",
        "composicao": "descrição do layout",
        "imagem": "descrição detalhada da foto/visual",
        "texto_criativo": "exatamente o que aparece na arte",
        "mood": "pesado e premium",
        "prompt_imagem": "detailed English prompt for AI image generation"
      }
    }
  ]
}`

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const raw = (message.content[0] as { text: string }).text.trim()
    const parsed = JSON.parse(raw)

    return NextResponse.json({
      posts: parsed.posts,
      tokens: message.usage.output_tokens,
    })
  } catch (err: unknown) {
    console.error("Criativo generation error:", err)
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Erro ao processar resposta da IA. Tente novamente." }, { status: 500 })
    }
    const msg = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
