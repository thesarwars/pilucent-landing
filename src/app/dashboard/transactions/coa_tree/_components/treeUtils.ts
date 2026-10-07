import type { VioletTone } from '@/components/violet';

/* ── account-type meta (UI only — drives swatch colour + tone) ─────────── */

export type GroupType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export const TYPE_META: Record<
  GroupType,
  { tone: VioletTone; swatch: string; label: string }
> = {
  Asset: { tone: 'violet', swatch: '#7C4DFF', label: 'Asset' },
  Liability: { tone: 'warn', swatch: '#F4A23B', label: 'Liability' },
  Equity: { tone: 'teal', swatch: '#14B8A6', label: 'Equity' },
  Income: { tone: 'success', swatch: '#22C55E', label: 'Income' },
  Expense: { tone: 'rose', swatch: '#FB7185', label: 'Expense' },
};

/** Map a synthetic root's title (Asset/Liability/…) to a known group, else null. */
export function groupOf(title?: string): GroupType | null {
  const t = (title || '').toLowerCase();
  if (t.includes('asset')) return 'Asset';
  if (t.includes('liabilit')) return 'Liability';
  if (t.includes('equity')) return 'Equity';
  if (t.includes('income')) return 'Income';
  if (t.includes('expense')) return 'Expense';
  return null;
}

/* ── balance / count aggregation (defensive about field name) ──────────── */

export function balanceOf(node: any): number {
  const raw =
    node?.balance ?? node?.current_balance ?? node?.net_balance ?? node?.opening_balance ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Count real accounts (nodes carrying a uid) in a subtree, excluding synthetic roots. */
export function countAccounts(node: any): number {
  if (!node) return 0;
  const self = node?.uid ? 1 : 0;
  const kids = Array.isArray(node?.children)
    ? node.children.reduce((acc: number, c: any) => acc + countAccounts(c), 0)
    : 0;
  return self + kids;
}

/** Sum balances of real accounts in a subtree (synthetic roots contribute nothing). */
export function sumBalance(node: any): number {
  if (!node) return 0;
  const self = node?.uid ? balanceOf(node) : 0;
  const kids = Array.isArray(node?.children)
    ? node.children.reduce((acc: number, c: any) => acc + sumBalance(c), 0)
    : 0;
  return self + kids;
}

/* ── search prune ──────────────────────────────────────────────────────── */

function matchesSelf(node: any, q: string): boolean {
  const hay = `${node?.title ?? ''} ${node?.code ?? ''}`.toLowerCase();
  return hay.includes(q);
}

/**
 * Returns a pruned copy of the subtree keeping only nodes on a path to a match,
 * or null if nothing in the subtree matches. Case-insensitive over title + code.
 */
export function pruneTree(node: any, q: string): any | null {
  if (!q) return node;
  const query = q.toLowerCase();
  // A direct hit keeps the node AND its full subtree, so a matched parent stays
  // expandable (caret + roll-up + subtotal) instead of collapsing to a leaf.
  if (matchesSelf(node, query)) return node;
  const children = Array.isArray(node?.children) ? node.children : [];
  const prunedKids = children.map((c: any) => pruneTree(c, query)).filter(Boolean);
  if (prunedKids.length > 0) {
    return { ...node, children: prunedKids };
  }
  return null;
}
