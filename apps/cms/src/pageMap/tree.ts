export type PageMapRow = {
  path: string
  parent: string | null
  template: string
  title: string
  status: string
  robots: string
  issues: string[]
  edit: string
  public: string | null
  preview: string | null
}

export type PageMapTreeNode = PageMapRow & {
  children: PageMapTreeNode[]
  depth: number
  key: string
  treeWarning?: 'cycle' | 'duplicate' | 'missing-parent'
}

export type PageMapTree = {
  roots: PageMapTreeNode[]
  warnings: string[]
}

export type PageMapSort = 'path' | 'title'

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' })

function compareNodes(sort: PageMapSort) {
  return (left: PageMapTreeNode, right: PageMapTreeNode): number => {
    const byValue = collator.compare(left[sort], right[sort])
    return byValue || collator.compare(left.path, right.path) || left.key.localeCompare(right.key)
  }
}

function sortNodes(nodes: PageMapTreeNode[], sort: PageMapSort): void {
  nodes.sort(compareNodes(sort))
  for (const node of nodes) sortNodes(node.children, sort)
}

function hasParentCycle(node: PageMapTreeNode, byPath: Map<string, PageMapTreeNode>): boolean {
  const visited = new Set<string>()
  let current: PageMapTreeNode | undefined = node
  while (current) {
    if (visited.has(current.path)) return true
    visited.add(current.path)
    current = current.parent ? byPath.get(current.parent) : undefined
  }
  return false
}

/**
 * Builds a defensive adjacency tree. Invalid relationships become roots so a
 * malformed API row cannot hide the rest of the page map or recurse forever.
 */
export function buildPageMapTree(rows: PageMapRow[], sort: PageMapSort = 'path'): PageMapTree {
  const warnings: string[] = []
  const pathCounts = new Map<string, number>()
  const nodes: PageMapTreeNode[] = rows.map((row) => {
    const count = (pathCounts.get(row.path) ?? 0) + 1
    pathCounts.set(row.path, count)
    const key = count === 1 ? row.path : `${row.path}#duplicate-${count}`
    return { ...row, children: [], depth: 0, key, treeWarning: count > 1 ? 'duplicate' : undefined }
  })
  for (const [path, count] of pathCounts) {
    if (count > 1) warnings.push(`Дублирующийся путь: ${path}`)
  }

  const roots: PageMapTreeNode[] = []
  const byPath = new Map<string, PageMapTreeNode>()
  for (const node of nodes) if (!byPath.has(node.path)) byPath.set(node.path, node)

  for (const node of nodes) {
    if (!node.parent) {
      roots.push(node)
      continue
    }
    const parent = byPath.get(node.parent)
    if (!parent || node.parent === node.path || hasParentCycle(node, byPath)) {
      node.treeWarning = !parent ? 'missing-parent' : 'cycle'
      roots.push(node)
      warnings.push(!parent ? `Пропущен родитель для: ${node.path}` : `Циклическая иерархия: ${node.path}`)
      continue
    }
    parent.children.push(node)
  }

  const setDepth = (items: PageMapTreeNode[], depth: number, visited = new Set<string>()): void => {
    for (const node of items) {
      if (visited.has(node.key)) {
        node.treeWarning = 'cycle'
        continue
      }
      node.depth = depth
      const next = new Set(visited)
      next.add(node.key)
      setDepth(node.children, depth + 1, next)
    }
  }
  sortNodes(roots, sort)
  setDepth(roots, 0)
  return { roots, warnings: [...new Set(warnings)] }
}

export function flattenPageMapTree(roots: PageMapTreeNode[], expanded?: ReadonlySet<string>): PageMapTreeNode[] {
  const result: PageMapTreeNode[] = []
  const visit = (nodes: PageMapTreeNode[]): void => {
    for (const node of nodes) {
      result.push(node)
      if (node.children.length && (expanded === undefined || expanded.has(node.key))) visit(node.children)
    }
  }
  visit(roots)
  return result
}

export function filterPageMapTree(
  roots: PageMapTreeNode[],
  predicate: (node: PageMapTreeNode) => boolean,
): PageMapTreeNode[] {
  const visit = (nodes: PageMapTreeNode[]): PageMapTreeNode[] => nodes.flatMap((node) => {
    const children = visit(node.children)
    if (!predicate(node) && children.length === 0) return []
    return [{ ...node, children }]
  })
  return visit(roots)
}

export function pageMapSearchPredicate(query: string, status = 'all'): (node: PageMapTreeNode) => boolean {
  const needle = query.trim().toLocaleLowerCase('ru')
  return (node) => {
    const statusMatch = status === 'all' || (status === 'draft' ? node.status.startsWith('draft-') : node.status === status)
    if (!statusMatch) return false
    return !needle || `${node.path} ${node.title} ${node.template}`.toLocaleLowerCase('ru').includes(needle)
  }
}

export function collectPageMapAncestors(roots: PageMapTreeNode[], predicate: (node: PageMapTreeNode) => boolean): Set<string> {
  const candidates = new Set<string>()
  const visit = (nodes: PageMapTreeNode[]): boolean => nodes.reduce((hasMatch, node) => {
    const childMatch = visit(node.children)
    if (childMatch) candidates.add(node.key)
    return hasMatch || predicate(node) || childMatch
  }, false)
  visit(roots)
  // A Set preserves insertion order. Return ancestors in the same preorder as
  // the rendered tree so callers can use it for stable UI state and tests.
  return new Set(flattenPageMapTree(roots).filter((node) => candidates.has(node.key)).map((node) => node.key))
}
