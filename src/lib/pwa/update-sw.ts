type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>

let updateServiceWorker: UpdateServiceWorker | undefined

export function setUpdateServiceWorker(fn: UpdateServiceWorker) {
  updateServiceWorker = fn
}

export function applyServiceWorkerUpdate() {
  return updateServiceWorker?.(true)
}
