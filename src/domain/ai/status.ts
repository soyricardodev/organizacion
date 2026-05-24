import { getAiModelId } from "@/lib/ai"

export function getAiStatus() {
  return {
    configured: Boolean(process.env.OPENROUTER_API_KEY),
    model: getAiModelId(),
  }
}
