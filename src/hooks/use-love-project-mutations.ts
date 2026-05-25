import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createLoveHomeProject,
  moveLoveHomeProject,
  updateLoveHomeProject,
} from "@/server/loveops"
import { queryKeys } from "@/lib/query-keys"
import type {
  CreateLoveProjectInput,
  MoveLoveProjectInput,
  UpdateLoveProjectInput,
} from "@/domain/loveops/types"

export function useLoveProjectMutations() {
  const queryClient = useQueryClient()

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: queryKeys.loveProjects })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateLoveProjectInput) => createLoveHomeProject({ data }),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLoveProjectInput) => updateLoveHomeProject({ data }),
    onSuccess: invalidate,
  })

  const moveMutation = useMutation({
    mutationFn: (data: MoveLoveProjectInput) => moveLoveHomeProject({ data }),
    onSuccess: invalidate,
  })

  return { createMutation, updateMutation, moveMutation }
}
