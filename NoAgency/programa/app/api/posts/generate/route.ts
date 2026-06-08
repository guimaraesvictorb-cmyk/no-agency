import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function nextPostingDates(postingDays: string[], frequency: number, weeks = 2): string[] {
  const DAY_MAP: Record<string, number> = {
    seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6, dom: 0,
  }
  const today = new Date()
  const dates: string[] = []
  const targetDays = postingDays.map((d) => DAY_MAP[d]).filter((n) => n !== undefined)
  if (targetDays.length === 0) {
    for (let i = 1; i <= frequency * weeks; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i * Math.floor(7 / frequency))
      dates.push(d.toISOString())
    }
    return dates
  }
  let checked = new Date(today)
  checked.setDate(checked.getDate() + 1)
  while (dates.length < frequency * weeks) {
    if (targetDays.includes(checked.getDay())) dates.push(checked.toISOString())
    checked.setDate(checked.getDate() + 1)
    if (checked.getTime() - today.getTime() > 1000 * 60 * 60 * 24 * 60) break
  }
  return dates
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada. Adicione no .env.local e reinicie." },
      { status: 500 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await req.json()
  const { brief, client_id } = body

  if (!brief || !client_id) {
    return NextResponse.json({ error: "brief e client_id são obrigatórios" }, { status: 400 })
  }

  // Verify user has access to this client
  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", client_id)
    .single()

  if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

  const postingDates = nextPostingDates(brief.posting_days ?? [], brief.posting_frequency ?? 3)

  const platformLabel = {
    instagram: "Instagram",
    facebook: "Facebook",
    instagram_facebook: "Instagram e Facebook",
  }[brief.platform as string] ?? "Instagram"

  const systemPrompt = `Você é um especialista em marketing de conteúdo para redes sociais brasileiras.
Você cria posts altamente engajadores, autênticos e estratégicos para ${platformLabel}.
Sempre escreva em português brasileiro, com naturalidade e sem anglicismos desnecessários.
Siga RIGOROSAMENTE o tom de voz definido pelo cliente.`

  const userPrompt = `Crie ${postingDates.length} posts completos para ${client.name}.

=== DNA DA MARCA ===
Empresa: ${brief.company_name}
Segmento: ${brief.segment}
Cidade: ${brief.city}
Diferenciais: ${brief.differentials}

=== CLIENTE IDEAL ===
Faixa etária: ${brief.ideal_client_age}
Gênero: ${brief.ideal_client_gender}
Principal dor: ${brief.ideal_client_pain}
Sonho/desejo: ${brief.ideal_client_dream}

=== TOM DE VOZ ===
Adjetivos: ${(brief.tone_adjectives ?? []).join(", ")}
O que evitar: ${brief.tone_avoid}
Exemplo de frase ideal: ${brief.tone_example}

=== OPERACIONAL ===
Plataforma: ${platformLabel}
Temas de conteúdo: ${(brief.content_themes ?? []).join(", ")}
Notas especiais: ${brief.ai_notes ?? "Nenhuma"}

=== INSTRUÇÕES ===
- Cada post deve ser impactante, com gancho forte na primeira linha
- Use emojis com moderação e de forma estratégica
- Inclua uma call-to-action (CTA) ao final
- Varie os formatos: educativo, bastidores, prova social, pergunta, oferta
- Mantenha o tom de voz definido acima

Responda SOMENTE com um JSON válido no seguinte formato (sem markdown, sem backticks):
{
  "posts": [
    {
      "caption": "texto completo do post com emojis e CTA",
      "image_prompt": "descrição detalhada em inglês para gerar a imagem do criativo (seja específico sobre cores, estilo, composição)",
      "content_type": "educativo|bastidores|prova_social|pergunta|oferta",
      "suggested_date_index": 0
    }
  ]
}`

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const raw = (message.content[0] as { text: string }).text.trim()
    const parsed = JSON.parse(raw)

    // Save posts to database
    const postsToInsert = parsed.posts.map((p: {
      caption: string
      image_prompt: string
      content_type: string
      suggested_date_index: number
    }) => ({
      client_id,
      status: "generated",
      platform: brief.platform,
      caption: p.caption,
      image_prompt: p.image_prompt,
      scheduled_for: postingDates[p.suggested_date_index] ?? postingDates[0] ?? null,
      ai_generation_metadata: {
        model: "claude-sonnet-4-6",
        content_type: p.content_type,
        tokens: message.usage.output_tokens,
        generated_at: new Date().toISOString(),
      },
    }))

    const { data: savedPosts, error } = await supabase
      .from("posts")
      .insert(postsToInsert)
      .select("id, caption, image_prompt, status, scheduled_for, platform")

    if (error) {
      console.error("Error saving posts:", error)
      return NextResponse.json({ error: "Erro ao salvar posts: " + error.message }, { status: 500 })
    }

    return NextResponse.json({
      posts: savedPosts,
      count: savedPosts?.length ?? 0,
      tokens_used: message.usage.output_tokens,
    })
  } catch (err: unknown) {
    console.error("Generation error:", err)
    const message = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: "Erro na geração: " + message }, { status: 500 })
  }
}
