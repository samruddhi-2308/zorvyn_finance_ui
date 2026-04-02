/**
 * Groups a list of items into a record using a key selector.
 * @param items - Source array.
 * @param keySelector - Function producing a group key for each item.
 * @returns Record keyed by the derived group key.
 */
export function groupBy<TItem>(
  items: readonly TItem[],
  keySelector: (item: TItem) => string,
): Record<string, TItem[]> {
  return items.reduce<Record<string, TItem[]>>((accumulator, item) => {
    const key = keySelector(item)

    if (!accumulator[key]) {
      accumulator[key] = []
    }

    accumulator[key].push(item)
    return accumulator
  }, {})
}
