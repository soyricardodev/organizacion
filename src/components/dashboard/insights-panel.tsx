import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { Button } from "@/components/ui/button"
import type { InsightData } from "@/domain/insights/types"

interface InsightsPanelProps {
  insight: InsightData | null | undefined
  aiConfigured: boolean
  aiModel?: string
  onGenerate: () => void
  isGenerating: boolean
}

export function InsightsPanel({
  insight,
  aiConfigured,
  aiModel,
  onGenerate,
  isGenerating,
}: InsightsPanelProps) {
  if (!aiConfigured) {
    return (
      <Panel>
        <PanelHeader>
          <PanelTitle>Insights</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <p className="text-muted-foreground text-xs">
            Configura OPENROUTER_API_KEY para análisis semanal con IA.
          </p>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Insights</PanelTitle>
        <Button
          variant="outline"
          size="xs"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "…" : "run"}
        </Button>
      </PanelHeader>
      <PanelBody>
        {insight ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs">{insight.title}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {insight.severity}
              </span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {insight.body}
            </p>
            {insight.recommendation && (
              <p className="border-l border-foreground/20 pl-3 text-xs">
                {insight.recommendation}
              </p>
            )}
            {(insight.model ?? aiModel) && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {insight.model ?? aiModel}
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">
            Análisis semanal de patrones y alertas.
            {aiModel && (
              <span className="mt-1 block text-[10px] uppercase tracking-widest">
                model: {aiModel}
              </span>
            )}
          </p>
        )}
      </PanelBody>
    </Panel>
  )
}
