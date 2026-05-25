import {
  LOVE_ACTIVITY_CATEGORIES,
  LOVE_ACTIVITY_TAGS,
  LOVE_CATEGORY_LABELS,
  LOVE_COST_LABELS,
  LOVE_COST_LEVELS,
  LOVE_TAG_LABELS,
  LOVE_WEATHER_LABELS,
  LOVE_WEATHER_PREFS,
  type LoveActivityCategory,
  type LoveActivityTag,
  type LoveCostLevel,
  type LoveWeatherPreference,
} from "@/domain/loveops/types"
import type { EnrichedLoveActivity } from "@/domain/loveops/get-activities"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export interface LoveopsActivityFormValues {
  title: string
  category: LoveActivityCategory
  costEstimation: LoveCostLevel
  weatherPreference: LoveWeatherPreference
  frequencyDaysTarget: string
  selectedTags: LoveActivityTag[]
  notes: string
}

const CATEGORY_ITEMS = LOVE_ACTIVITY_CATEGORIES.map((value) => ({
  value,
  label: LOVE_CATEGORY_LABELS[value],
}))

const COST_ITEMS = LOVE_COST_LEVELS.map((value) => ({
  value,
  label: LOVE_COST_LABELS[value],
}))

const WEATHER_ITEMS = LOVE_WEATHER_PREFS.map((value) => ({
  value,
  label: LOVE_WEATHER_LABELS[value],
}))

interface LoveopsActivityFormFieldsProps {
  values: LoveopsActivityFormValues
  onChange: (values: LoveopsActivityFormValues) => void
  idPrefix?: string
}

export function LoveopsActivityFormFields({
  values,
  onChange,
  idPrefix = "activity",
}: LoveopsActivityFormFieldsProps) {
  function patch(partial: Partial<LoveopsActivityFormValues>) {
    onChange({ ...values, ...partial })
  }

  function toggleTag(tag: LoveActivityTag) {
    const selectedTags = values.selectedTags.includes(tag)
      ? values.selectedTags.filter((item) => item !== tag)
      : [...values.selectedTags, tag]
    patch({ selectedTags })
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-title`} className="label-caps">
          título
        </FieldLabel>
        <Input
          id={`${idPrefix}-title`}
          value={values.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="paseo nocturno"
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel className="label-caps">tipo</FieldLabel>
          <Select
            items={CATEGORY_ITEMS}
            value={values.category}
            onValueChange={(v) => patch({ category: v as LoveActivityCategory })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CATEGORY_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-freq`} className="label-caps">
            cada (días)
          </FieldLabel>
          <Input
            id={`${idPrefix}-freq`}
            inputMode="numeric"
            value={values.frequencyDaysTarget}
            onChange={(e) => patch({ frequencyDaysTarget: e.target.value })}
            required
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel className="label-caps">costo</FieldLabel>
          <Select
            items={COST_ITEMS}
            value={values.costEstimation}
            onValueChange={(v) => patch({ costEstimation: v as LoveCostLevel })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {COST_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel className="label-caps">clima</FieldLabel>
          <Select
            items={WEATHER_ITEMS}
            value={values.weatherPreference}
            onValueChange={(v) =>
              patch({ weatherPreference: v as LoveWeatherPreference })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {WEATHER_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field>
        <FieldLabel className="label-caps">tags</FieldLabel>
        <div className="flex flex-wrap gap-1">
          {LOVE_ACTIVITY_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={
                values.selectedTags.includes(tag)
                  ? "rounded-md bg-foreground px-2 py-1 text-[10px] uppercase tracking-widest text-background"
                  : "rounded-md border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground"
              }
            >
              {LOVE_TAG_LABELS[tag]}
            </button>
          ))}
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-notes`} className="label-caps">
          notas
        </FieldLabel>
        <Textarea
          id={`${idPrefix}-notes`}
          value={values.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          placeholder="ideas, recordatorios…"
          rows={2}
        />
      </Field>
    </FieldGroup>
  )
}

export function activityToFormValues(
  activity: Pick<
    EnrichedLoveActivity,
    | "title"
    | "category"
    | "tags"
    | "costEstimation"
    | "weatherPreference"
    | "frequencyDaysTarget"
    | "notes"
  >,
): LoveopsActivityFormValues {
  return {
    title: activity.title,
    category: activity.category,
    costEstimation: activity.costEstimation,
    weatherPreference: activity.weatherPreference,
    frequencyDaysTarget: String(activity.frequencyDaysTarget),
    selectedTags: activity.tags,
    notes: activity.notes ?? "",
  }
}

export function formValuesToPayload(values: LoveopsActivityFormValues) {
  return {
    title: values.title.trim(),
    category: values.category,
    tags: values.selectedTags,
    costEstimation: values.costEstimation,
    weatherPreference: values.weatherPreference,
    frequencyDaysTarget: Number(values.frequencyDaysTarget),
    notes: values.notes.trim() || undefined,
  }
}
