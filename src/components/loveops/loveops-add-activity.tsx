import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { createLoveActivity } from "@/server/loveops"
import {
  LOVE_ACTIVITY_CATEGORIES,
  LOVE_ACTIVITY_TAGS,
  LOVE_CATEGORY_LABELS,
  LOVE_COST_LABELS,
  LOVE_COST_LEVELS,
  LOVE_TAG_LABELS,
  type LoveActivityCategory,
  type LoveActivityTag,
  type LoveCostLevel,
} from "@/domain/loveops/types"

const CATEGORY_ITEMS = LOVE_ACTIVITY_CATEGORIES.map((value) => ({
  value,
  label: LOVE_CATEGORY_LABELS[value],
}))

const COST_ITEMS = LOVE_COST_LEVELS.map((value) => ({
  value,
  label: LOVE_COST_LABELS[value],
}))

interface LoveopsAddActivityProps {
  onCreated: () => void
}

export function LoveopsAddActivity({ onCreated }: LoveopsAddActivityProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<LoveActivityCategory>("micro")
  const [costEstimation, setCostEstimation] = useState<LoveCostLevel>("low")
  const [frequencyDaysTarget, setFrequencyDaysTarget] = useState("7")
  const [selectedTags, setSelectedTags] = useState<LoveActivityTag[]>(["quality_time"])
  const [pending, setPending] = useState(false)

  function toggleTag(tag: LoveActivityTag) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || selectedTags.length === 0) return
    setPending(true)
    try {
      await createLoveActivity({
        data: {
          title: title.trim(),
          category,
          tags: selectedTags,
          costEstimation,
          frequencyDaysTarget: Number(frequencyDaysTarget),
        },
      })
      setTitle("")
      onCreated()
    } finally {
      setPending(false)
    }
  }

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Nueva actividad</PanelTitle>
      </PanelHeader>
      <PanelBody>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel className="label-caps">título</FieldLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="paseo nocturno"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="label-caps">tipo</FieldLabel>
                <Select
                  items={CATEGORY_ITEMS}
                  value={category}
                  onValueChange={(v) => setCategory(v as LoveActivityCategory)}
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
                <FieldLabel className="label-caps">cada (días)</FieldLabel>
                <Input
                  inputMode="numeric"
                  value={frequencyDaysTarget}
                  onChange={(e) => setFrequencyDaysTarget(e.target.value)}
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel className="label-caps">costo</FieldLabel>
              <Select
                items={COST_ITEMS}
                value={costEstimation}
                onValueChange={(v) => setCostEstimation(v as LoveCostLevel)}
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
              <FieldLabel className="label-caps">tags</FieldLabel>
              <div className="flex flex-wrap gap-1">
                {LOVE_ACTIVITY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={
                      selectedTags.includes(tag)
                        ? "rounded-md bg-foreground px-2 py-1 text-[10px] uppercase tracking-widest text-background"
                        : "rounded-md border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground"
                    }
                  >
                    {LOVE_TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
            </Field>
            <Button type="submit" disabled={pending || selectedTags.length === 0} className="w-full">
              {pending ? "…" : "agregar actividad"}
            </Button>
          </FieldGroup>
        </form>
      </PanelBody>
    </Panel>
  )
}
