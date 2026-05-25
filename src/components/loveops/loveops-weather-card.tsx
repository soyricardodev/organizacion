import { CloudRain, Snowflake, Sun } from "lucide-react"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import type { WeatherSnapshot } from "@/domain/loveops/get-weather"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"

interface LoveopsWeatherCardProps {
  weather: WeatherSnapshot
  suggestions: EnrichedLoveActivity[]
  onLog?: (activityId: string) => void
}

export function LoveopsWeatherCard({
  weather,
  suggestions,
  onLog,
}: LoveopsWeatherCardProps) {
  if (!weather.configured) {
    return (
      <Panel>
        <PanelHeader>
          <PanelTitle>Clima</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Añade OPENWEATHER_API_KEY para activar el botón del clima.
          </p>
        </PanelBody>
      </Panel>
    )
  }

  const Icon = weather.isRainy ? CloudRain : weather.isCold ? Snowflake : Sun
  const trigger =
    weather.isRainy || weather.isCold
      ? weather.isRainy
        ? "Está lloviendo — buen momento para salir a comer juntos."
        : "Hace frío — plan de abrazo, comida caliente o escapada."
      : null

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Clima · {weather.locationLabel}</PanelTitle>
        <Icon className="size-4 text-muted-foreground" />
      </PanelHeader>
      <PanelBody className="flex flex-col gap-3">
        <p className="text-xs capitalize">
          {weather.description ?? "Sin datos"} ·{" "}
          {weather.temperatureC !== null ? `${weather.temperatureC}°C` : "—"}
        </p>
        {trigger && (
          <p className="rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs leading-relaxed text-sky-900 dark:text-sky-100">
            {trigger}
          </p>
        )}
        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2">
            {suggestions.slice(0, 3).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span>{activity.title}</span>
                {onLog && (
                  <button
                    type="button"
                    onClick={() => onLog(activity.id)}
                    className="shrink-0 text-[10px] uppercase tracking-widest underline-offset-2 hover:underline"
                  >
                    activar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
