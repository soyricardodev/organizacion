import { createOpenRouter } from "@openrouter/ai-sdk-provider"

/** Barato + razonamiento explícito vía OpenRouter */
const DEFAULT_MODEL = "deepseek/deepseek-r1-distill-qwen-32b"

let openrouter: ReturnType<typeof createOpenRouter> | null = null

function getOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null
  openrouter ??= createOpenRouter({ apiKey })
  return openrouter
}

export function getAiModel() {
  const client = getOpenRouter()
  if (!client) return null
  const modelId = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL
  return client(modelId)
}

export function getAiModelId(): string {
  return process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL
}

export function requireAiModel() {
  const model = getAiModel()
  if (!model) {
    throw new Error(
      "Configura OPENROUTER_API_KEY para usar funciones de IA.",
    )
  }
  return model
}

/** Opciones para modelos con cadena de razonamiento (DeepSeek R1, etc.) */
export function aiProviderOptions() {
  return {
    openrouter: {
      reasoning: {
        max_tokens: 2048,
      },
    },
  } as const
}
