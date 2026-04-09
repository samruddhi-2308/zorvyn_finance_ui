import { useEffect } from 'react'

interface UseSearchShortcutOptions {
  readonly searchInputId: string
}

export function useSearchShortcut({
  searchInputId,
}: UseSearchShortcutOptions): void {
  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== '/') {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const activeElement = document.activeElement
      const isTextEntryFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable)

      if (isTextEntryFocused) {
        return
      }

      const searchField = document.getElementById(searchInputId)
      if (!(searchField instanceof HTMLInputElement)) {
        return
      }

      event.preventDefault()
      searchField.focus()
      searchField.select()
    }

    window.addEventListener('keydown', onGlobalKeyDown)

    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown)
    }
  }, [searchInputId])
}
