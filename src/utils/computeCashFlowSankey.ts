import { EXPENSE_CATEGORIES } from '@/constants'
import type {
  CashFlowSankeyData,
  CashFlowSankeyNode,
  ExpenseCategory,
  Transaction,
} from '@/types'

const FIXED_EXPENSE_CATEGORIES = new Set<ExpenseCategory>([
  'Utilities',
  'Healthcare',
  'Transport',
])

const MAX_TOTAL_NODES = 20
const BASE_NODE_COUNT = 4
const MAX_CATEGORY_NODES = MAX_TOTAL_NODES - BASE_NODE_COUNT
const MAX_OTHER_AGGREGATE_NODES = 2
const MIN_CATEGORY_SHARE_OF_EXPENSES = 0.01

interface ExpenseGroup {
  readonly category: ExpenseCategory
  readonly kind: 'fixed' | 'variable'
  readonly totalAmount: number
  readonly transactionCount: number
}

interface SankeyGraphLink {
  readonly source: string
  readonly target: string
  readonly value: number
}

interface SankeyValidationResult {
  readonly isValid: boolean
  readonly reason?: string
}

function getExpenseKind(category: ExpenseCategory): 'fixed' | 'variable' {
  return FIXED_EXPENSE_CATEGORIES.has(category) ? 'fixed' : 'variable'
}

function toCategoryId(category: ExpenseCategory): string {
  return `category.${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function logSankeyGraph(
  nodes: readonly CashFlowSankeyNode[],
  links: readonly SankeyGraphLink[],
): void {
  if (typeof window === 'undefined' || !import.meta.env.DEV) {
    return
  }

  console.info('[computeCashFlowSankey] nodes', nodes)
  console.info('[computeCashFlowSankey] links', links)
}

function validateSankeyGraph(
  nodes: readonly CashFlowSankeyNode[],
  links: readonly SankeyGraphLink[],
): SankeyValidationResult {
  const nodeIdSet = new Set<string>()

  for (const node of nodes) {
    if (nodeIdSet.has(node.id)) {
      return {
        isValid: false,
        reason: `Duplicate node id detected: ${node.id}`,
      }
    }

    nodeIdSet.add(node.id)
  }

  const adjacency = new Map<string, string[]>()

  for (const node of nodes) {
    adjacency.set(node.id, [])
  }

  for (const link of links) {
    if (!nodeIdSet.has(link.source)) {
      return {
        isValid: false,
        reason: `Link source does not match any node id: ${link.source}`,
      }
    }

    if (!nodeIdSet.has(link.target)) {
      return {
        isValid: false,
        reason: `Link target does not match any node id: ${link.target}`,
      }
    }

    if (link.source === link.target) {
      return {
        isValid: false,
        reason: `Self-cycle detected at node id: ${link.source}`,
      }
    }

    if (link.value <= 0 || !Number.isFinite(link.value)) {
      return {
        isValid: false,
        reason: `Non-positive or invalid link value for ${link.source} -> ${link.target}`,
      }
    }

    const targets = adjacency.get(link.source)

    if (targets === undefined) {
      return {
        isValid: false,
        reason: `Adjacency is missing node id: ${link.source}`,
      }
    }

    targets.push(link.target)
  }

  const visitState = new Map<string, 0 | 1 | 2>()

  for (const node of nodes) {
    visitState.set(node.id, 0)
  }

  const hasCycleFrom = (nodeId: string): boolean => {
    const state = visitState.get(nodeId)

    if (state === 1) {
      return true
    }

    if (state === 2) {
      return false
    }

    visitState.set(nodeId, 1)

    const neighbors = adjacency.get(nodeId) ?? []

    for (const nextNodeId of neighbors) {
      if (hasCycleFrom(nextNodeId)) {
        return true
      }
    }

    visitState.set(nodeId, 2)
    return false
  }

  for (const node of nodes) {
    if (hasCycleFrom(node.id)) {
      return {
        isValid: false,
        reason: `Circular dependency detected in Sankey DAG at node id: ${node.id}`,
      }
    }
  }

  return { isValid: true }
}

function toIndexedSankeyData(
  nodes: readonly CashFlowSankeyNode[],
  links: readonly SankeyGraphLink[],
): CashFlowSankeyData {
  const nodeIndexById = new Map<string, number>()

  for (const [index, node] of nodes.entries()) {
    nodeIndexById.set(node.id, index)
  }

  const indexedLinks: CashFlowSankeyData['links'][number][] = []

  for (const link of links) {
    const sourceIndex = nodeIndexById.get(link.source)
    const targetIndex = nodeIndexById.get(link.target)

    if (sourceIndex === undefined || targetIndex === undefined) {
      console.error('[computeCashFlowSankey] Link endpoint index resolution failed', {
        link,
      })

      return {
        nodes: [],
        links: [],
      }
    }

    indexedLinks.push({
      source: sourceIndex,
      target: targetIndex,
      value: link.value,
    })
  }

  return {
    nodes,
    links: indexedLinks,
  }
}

/**
 * Builds an aggregated Sankey model:
 * Total Income -> Savings / Fixed Expenses / Variable Expenses -> Expense Categories.
 */
export function computeCashFlowSankey(
  transactions: readonly Transaction[],
): CashFlowSankeyData {
  const incomeTransactions = transactions.filter(
    (transaction) => transaction.type === 'income',
  )
  const expenseTransactions = transactions
    .filter((transaction) => transaction.type === 'expense')
    .filter((transaction) =>
      (EXPENSE_CATEGORIES as readonly string[]).includes(transaction.category),
    )

  if (incomeTransactions.length === 0 && expenseTransactions.length === 0) {
    return {
      nodes: [],
      links: [],
    }
  }

  let incomeTransactionCount = 0
  const totalIncome = incomeTransactions.reduce((sum, transaction) => {
    const amount = Number(transaction.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      return sum
    }

    incomeTransactionCount += 1
    return sum + amount
  }, 0)

  const expenseGroups = new Map<ExpenseCategory, ExpenseGroup>()
  let fixedTotal = 0
  let variableTotal = 0
  let fixedTransactionCount = 0
  let variableTransactionCount = 0

  for (const transaction of expenseTransactions) {
    const amount = Number(transaction.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      continue
    }

    const category = transaction.category as ExpenseCategory
    const kind = getExpenseKind(category)
    const existingGroup = expenseGroups.get(category)

    if (kind === 'fixed') {
      fixedTotal += amount
      fixedTransactionCount += 1
    } else {
      variableTotal += amount
      variableTransactionCount += 1
    }

    if (existingGroup) {
      expenseGroups.set(category, {
        ...existingGroup,
        totalAmount: existingGroup.totalAmount + amount,
        transactionCount: existingGroup.transactionCount + 1,
      })
      continue
    }

    expenseGroups.set(category, {
      category,
      kind,
      totalAmount: amount,
      transactionCount: 1,
    })
  }

  const totalExpenses = fixedTotal + variableTotal
  const savingsAmount = Math.max(0, totalIncome - totalExpenses)

  if (totalIncome <= 0 && totalExpenses <= 0) {
    return {
      nodes: [],
      links: [],
    }
  }

  const nodes: CashFlowSankeyNode[] = []
  const links: SankeyGraphLink[] = []

  const addNode = (node: CashFlowSankeyNode): void => {
    nodes.push(node)
  }

  const addLink = (source: string, target: string, value: number): void => {
    if (!Number.isFinite(value) || value <= 0) {
      return
    }

    links.push({ source, target, value })
  }

  addNode({
    id: 'income.total',
    name: 'Total Income',
    kind: 'root',
    totalAmount: totalIncome,
    transactionCount: incomeTransactionCount,
  })
  addNode({
    id: 'allocation.savings',
    name: 'Savings',
    kind: 'allocation',
    totalAmount: savingsAmount,
  })
  addNode({
    id: 'allocation.fixed-expenses',
    name: 'Fixed Expenses',
    kind: 'allocation',
    totalAmount: fixedTotal,
    transactionCount: fixedTransactionCount,
    shareOfExpenses: totalExpenses > 0 ? fixedTotal / totalExpenses : 0,
  })
  addNode({
    id: 'allocation.variable-expenses',
    name: 'Variable Expenses',
    kind: 'allocation',
    totalAmount: variableTotal,
    transactionCount: variableTransactionCount,
    shareOfExpenses: totalExpenses > 0 ? variableTotal / totalExpenses : 0,
  })

  if (savingsAmount > 0) {
    addLink('income.total', 'allocation.savings', savingsAmount)
  }

  if (fixedTotal > 0) {
    addLink('income.total', 'allocation.fixed-expenses', fixedTotal)
  }

  if (variableTotal > 0) {
    addLink('income.total', 'allocation.variable-expenses', variableTotal)
  }

  const sortedGroups = [...expenseGroups.values()].sort(
    (left, right) => right.totalAmount - left.totalAmount,
  )

  const majorCandidates: ExpenseGroup[] = []
  const underThresholdGroups: ExpenseGroup[] = []

  for (const group of sortedGroups) {
    const share =
      totalExpenses > 0 ? group.totalAmount / totalExpenses : 0

    if (share < MIN_CATEGORY_SHARE_OF_EXPENSES) {
      underThresholdGroups.push(group)
      continue
    }

    majorCandidates.push(group)
  }

  const majorGroups = majorCandidates.slice(
    0,
    Math.max(0, MAX_CATEGORY_NODES - MAX_OTHER_AGGREGATE_NODES),
  )
  const overflowGroups = majorCandidates.slice(majorGroups.length)
  const aggregatedGroups = [...underThresholdGroups, ...overflowGroups]

  let otherFixedAmount = 0
  let otherVariableAmount = 0
  let otherFixedTransactionCount = 0
  let otherVariableTransactionCount = 0

  for (const group of aggregatedGroups) {
    if (group.kind === 'fixed') {
      otherFixedAmount += group.totalAmount
      otherFixedTransactionCount += group.transactionCount
      continue
    }

    otherVariableAmount += group.totalAmount
    otherVariableTransactionCount += group.transactionCount
  }

  for (const group of majorGroups) {
    const branchNodeId =
      group.kind === 'fixed'
        ? 'allocation.fixed-expenses'
        : 'allocation.variable-expenses'
    const categoryNodeId = toCategoryId(group.category)

    addNode({
      id: categoryNodeId,
      name: group.category,
      kind: 'category',
      category: group.category,
      totalAmount: group.totalAmount,
      transactionCount: group.transactionCount,
      shareOfExpenses:
        totalExpenses > 0 ? group.totalAmount / totalExpenses : 0,
    })

    addLink(branchNodeId, categoryNodeId, group.totalAmount)
  }

  if (otherFixedAmount > 0) {
    addNode({
      id: 'aggregate.other-fixed-expenses',
      name: 'Other Fixed Expenses',
      kind: 'aggregate',
      totalAmount: otherFixedAmount,
      transactionCount: otherFixedTransactionCount,
      shareOfExpenses:
        totalExpenses > 0 ? otherFixedAmount / totalExpenses : 0,
    })

    addLink(
      'allocation.fixed-expenses',
      'aggregate.other-fixed-expenses',
      otherFixedAmount,
    )
  }

  if (otherVariableAmount > 0) {
    addNode({
      id: 'aggregate.other-variable-expenses',
      name: 'Other Variable Expenses',
      kind: 'aggregate',
      totalAmount: otherVariableAmount,
      transactionCount: otherVariableTransactionCount,
      shareOfExpenses:
        totalExpenses > 0 ? otherVariableAmount / totalExpenses : 0,
    })

    addLink(
      'allocation.variable-expenses',
      'aggregate.other-variable-expenses',
      otherVariableAmount,
    )
  }

  logSankeyGraph(nodes, links)

  const validationResult = validateSankeyGraph(nodes, links)

  if (!validationResult.isValid) {
    console.error('[computeCashFlowSankey] Invalid DAG detected', {
      reason: validationResult.reason,
      nodes,
      links,
    })

    return {
      nodes: [],
      links: [],
    }
  }

  console.log({ nodes, links })

  return toIndexedSankeyData(nodes, links)
}
