import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { suggestLoveDate } from "@/server/loveops"

interface LoveopsSuggestPanelProps {
  month: string
  aiConfigured: boolean
}

export function LoveopsSuggestPanel({
  month,
  aiConfigured,
}: LoveopsSuggestPanelProps) {
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof suggestLoveDate>
  > | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSuggest() {
    setPending(true)
    try {
      const response = await suggestLoveDate({ data: { month } })
      setResult(response)
    } finally {
      setPending(false)
    }
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Sugerir cita</PanelTitle>
      </PanelHeader>
      <PanelBody className="flex flex-col gap-3">
        {!aiConfigured ? (
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Configura OPENROUTER_API_KEY para ideas de fin de semana.
          </p>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={handleSuggest}
          >
            {pending ? "…" : "generar plan"}
          </Button>
        )}
        {result?.suggestion && (
          <div className="flex flex-col gap-2 rounded-md border border-border px-3 py-3">
            <p className="text-xs font-medium">{result.suggestion.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {result.suggestion.plan}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              ~{result.suggestion.estimatedCostUsd} · {result.suggestion.whyNow}
            </p>
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
