'use client';

import * as React from 'react';
import { ChevronRight, Plus, Pencil, Trash2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONTROL_ACCOUNT_HINT } from '@/lib/helpers/apiErrors';
import { Chip, money } from '@/components/violet';
import { balanceOf, sumBalance } from './treeUtils';

/* layout constants — left padding encodes depth */
const ROW_PAD_L = 22;
const INDENT = 24;
const RAIL_OFF = 11; // x of a parent's rail, measured from its row's left padding

export interface VioletTreeProps {
  node: any;
  depth?: number;
  /** index among siblings + whether it's the last (for trunk continuation). */
  isLast?: boolean;
  swatch: string;
  /** bumped whenever expand-all / collapse-all is pressed. */
  expandVersion: number;
  expandOpen: boolean;
  /** while a search is active every branch is force-opened. */
  searchActive?: boolean;
  permissions?: string[];
  onAdd?: (uid: string) => void;
  onEdit?: (uid: string) => void;
  onDelete?: (uid: string) => void;
}

const ACTION_BTN =
  'flex h-[26px] w-[26px] items-center justify-center rounded-[8px] border-none bg-transparent text-v-ink400 transition-colors hover:bg-v-tint100 hover:text-v-primary';

/** Control accounts (`is_fixed`) keep their controls visible but inert. */
const DISABLED_ACTION_BTN =
  'cursor-not-allowed text-v-ink300 hover:bg-transparent hover:text-v-ink300';

export default function VioletTree({
  node,
  depth = 0,
  isLast = true,
  swatch,
  expandVersion,
  expandOpen,
  searchActive,
  permissions = [],
  onAdd,
  onEdit,
  onDelete,
}: VioletTreeProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    setIsExpanded(expandOpen);
  }, [expandVersion, expandOpen]);

  const children: any[] = Array.isArray(node?.children) ? node.children : [];
  const hasChildren = children.length > 0;
  const open = searchActive ? true : isExpanded;

  const isAccount = !!node?.uid; // real account vs synthetic type root
  const canAdd = permissions.includes('add_chartofaccount');
  const canEdit = permissions.includes('change_chartofaccount');
  const canDelete = permissions.includes('delete_chartofaccount');

  const bal = hasChildren ? sumBalance(node) : balanceOf(node);
  const padLeft = ROW_PAD_L + depth * INDENT;

  // depth-scaled name typography
  const nameClass =
    depth === 0
      ? 'text-[14px] font-bold'
      : depth === 1
        ? 'text-[13.5px] font-semibold'
        : 'text-[13px] font-medium';

  const railX = ROW_PAD_L + (depth - 1) * INDENT + RAIL_OFF;

  return (
    <div className="animate-v-pop" style={{ animationDelay: `${Math.min(depth, 6) * 0.02}s` }}>
      <div
        role={hasChildren ? 'button' : undefined}
        onClick={hasChildren ? () => setIsExpanded((v) => !v) : undefined}
        className={cn(
          'group relative flex items-center gap-2.5 border-b border-[rgba(22,23,42,0.06)] py-2.5 pr-[22px] transition-colors',
          hasChildren ? 'cursor-pointer hover:bg-[#F7F5FC]' : 'hover:bg-[#F7F5FC]'
        )}
        style={{ paddingLeft: padLeft }}
      >
        {/* ── connector lines ── */}
        {depth > 0 && (
          <>
            {/* faint full-height ancestor rails */}
            {Array.from({ length: depth - 1 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="pointer-events-none absolute bottom-0 top-0 w-[1.5px] bg-[#E6E1F2]"
                style={{ left: ROW_PAD_L + i * INDENT + RAIL_OFF }}
              />
            ))}
            {/* active elbow: vertical (top half) draws down */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 w-[1.5px] origin-top animate-v-grow-y bg-[#D9D2EC]"
              style={{ left: railX, height: 'calc(50% + 0.75px)' }}
            />
            {/* trunk continuation past this node when it isn't the last sibling */}
            {!isLast && (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 w-[1.5px] bg-[#E6E1F2]"
                style={{ left: railX, top: 'calc(50% + 0.75px)' }}
              />
            )}
            {/* active elbow: horizontal tick draws right */}
            <span
              aria-hidden
              className="pointer-events-none absolute h-[1.5px] origin-left animate-v-grow-x bg-[#D9D2EC]"
              style={{ left: railX, top: 'calc(50% - 0.75px)', width: INDENT - RAIL_OFF + 2 }}
            />
          </>
        )}

        {/* caret */}
        <span
          className={cn(
            'relative z-[1] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-transform duration-200',
            hasChildren ? 'text-v-ink400' : 'opacity-0',
            open && hasChildren && 'rotate-90'
          )}
        >
          <ChevronRight className="h-[13px] w-[13px]" />
        </span>

        {/* type swatch */}
        <span
          aria-hidden
          className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
          style={{ background: swatch }}
        />

        {/* name */}
        <span className={cn('truncate text-v-ink900', nameClass)}>{node?.title}</span>

        {/* code chip */}
        {node?.code && (
          <span className="shrink-0 rounded-md bg-v-wash2 px-[7px] py-0.5 text-[10.5px] font-bold tabular-nums text-v-ink500">
            {node.code}
          </span>
        )}

        {/* roll-up pill (parents) */}
        {hasChildren && (
          <Chip tone="violet" className="shrink-0 animate-v-pop px-2 py-0.5 text-[10.5px]">
            {children.length}
          </Chip>
        )}

        <span className="flex-1" />

        {/* hover row actions (real accounts only) — wired to existing handlers */}
        <div
          className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {isAccount && canAdd && (
            <button
              type="button"
              title="Add sub-account"
              onClick={() => onAdd?.(node.uid)}
              className={ACTION_BTN}
            >
              <Plus className="h-[15px] w-[15px]" />
            </button>
          )}
          {/* Control accounts keep their controls visible but disabled, so the row
              does not read as editable-but-broken. */}
          {isAccount && canEdit && (
            <button
              type="button"
              title={node?.is_fixed ? CONTROL_ACCOUNT_HINT : 'Edit account'}
              disabled={node?.is_fixed}
              onClick={() => !node?.is_fixed && onEdit?.(node.uid)}
              className={cn(ACTION_BTN, node?.is_fixed && DISABLED_ACTION_BTN)}
            >
              <Pencil className="h-[14px] w-[14px]" />
            </button>
          )}
          {isAccount && canDelete && (
            <button
              type="button"
              title={node?.is_fixed ? CONTROL_ACCOUNT_HINT : 'Delete account'}
              disabled={node?.is_fixed}
              onClick={() => !node?.is_fixed && onDelete?.(node.uid)}
              className={cn(
                ACTION_BTN,
                node?.is_fixed
                  ? DISABLED_ACTION_BTN
                  : 'hover:bg-v-danger-bg hover:text-v-danger-fg'
              )}
            >
              {node?.is_fixed ? (
                <Lock className="h-[14px] w-[14px]" />
              ) : (
                <Trash2 className="h-[14px] w-[14px]" />
              )}
            </button>
          )}
        </div>

        {/* balance */}
        <span
          className={cn(
            'shrink-0 text-right text-[13px] tabular-nums',
            depth === 0 ? 'font-bold' : 'font-semibold',
            bal === 0 ? 'text-v-ink400' : bal < 0 ? 'text-[#D2483E]' : 'text-v-ink900'
          )}
        >
          {money(bal)}
        </span>
      </div>

      {/* children */}
      {open && hasChildren && (
        <div>
          {children.map((child: any, i: number) => (
            <VioletTree
              key={child?.uid || child?.id || `${depth}-${i}`}
              node={child}
              depth={depth + 1}
              isLast={i === children.length - 1}
              swatch={swatch}
              expandVersion={expandVersion}
              expandOpen={expandOpen}
              searchActive={searchActive}
              permissions={permissions}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
