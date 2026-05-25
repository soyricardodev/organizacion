import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/dashboard/panel"
import {
  LOVE_PROJECT_COLUMN_LABELS,
  type LoveProjectColumn,
} from "@/domain/loveops/types"
import { useLoveProjectMutations } from "@/hooks/use-love-project-mutations"
import type { LoveHomeProject } from "@/db/schema"

type GroupedProjects = Record<LoveProjectColumn, LoveHomeProject[]>

const COLUMN_ORDER: LoveProjectColumn[] = [
  "ideas",
  "materials",
  "in_progress",
  "done",
]

interface LoveopsHomeKanbanProps {
  projects: GroupedProjects
}

export function LoveopsHomeKanban({ projects }: LoveopsHomeKanbanProps) {
  const [title, setTitle] = useState("")
  const { createMutation, moveMutation } = useLoveProjectMutations()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate({
      title: title.trim(),
      column: "ideas",
      costEstimation: "zero",
    })
    setTitle("")
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva idea de hogar"
          className="rounded-md border-border bg-transparent"
        />
        <Button type="submit" disabled={createMutation.isPending}>
          +
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {COLUMN_ORDER.map((column) => (
          <Panel key={column}>
            <PanelHeader>
              <PanelTitle>{LOVE_PROJECT_COLUMN_LABELS[column]}</PanelTitle>
              <span className="text-[10px] text-muted-foreground">
                {projects[column].length}
              </span>
            </PanelHeader>
            <PanelBody className="flex flex-col gap-2 p-0">
              {projects[column].length === 0 ? (
                <p className="px-4 py-3 text-[10px] text-muted-foreground uppercase tracking-widest">
                  vacío
                </p>
              ) : (
                projects[column].map((project) => (
                  <div
                    key={project.id}
                    className="border-t border-border px-4 py-3 first:border-t-0"
                  >
                    <p className="text-xs">{project.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {COLUMN_ORDER.filter((next) => next !== column).map(
                        (next) => (
                          <Button
                            key={next}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[9px] uppercase tracking-widest"
                            disabled={moveMutation.isPending}
                            onClick={() =>
                              moveMutation.mutate({ id: project.id, column: next })
                            }
                          >
                            → {LOVE_PROJECT_COLUMN_LABELS[next]}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                ))
              )}
            </PanelBody>
          </Panel>
        ))}
      </div>
    </div>
  )
}
