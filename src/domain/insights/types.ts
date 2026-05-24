export interface InsightData {
  title: string
  body: string
  severity: "info" | "warning" | "critical"
  recommendation?: string
  model?: string | null
}
