import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import { createLoveActivity } from "@/server/loveops"
import {
  LoveopsActivityFormFields,
  formValuesToPayload,
  type LoveopsActivityFormValues,
} from "@/components/loveops/loveops-activity-form-fields"

const EMPTY_FORM: LoveopsActivityFormValues = {
  title: "",
  category: "micro",
  costEstimation: "low",
  weatherPreference: "any",
  frequencyDaysTarget: "7",
  selectedTags: ["quality_time"],
  notes: "",
}

interface LoveopsAddActivityProps {
  onCreated: () => void
}

export function LoveopsAddActivity({ onCreated }: LoveopsAddActivityProps) {
  const [values, setValues] = useState<LoveopsActivityFormValues>(EMPTY_FORM)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.title.trim() || values.selectedTags.length === 0) return
    setPending(true)
    try {
      await createLoveActivity({ data: formValuesToPayload(values) })
      setValues(EMPTY_FORM)
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
          <LoveopsActivityFormFields
            values={values}
            onChange={setValues}
            idPrefix="new-activity"
          />
          <Button
            type="submit"
            disabled={pending || values.selectedTags.length === 0}
            className="mt-4 w-full"
          >
            {pending ? "…" : "agregar actividad"}
          </Button>
        </form>
      </PanelBody>
    </Panel>
  )
}
