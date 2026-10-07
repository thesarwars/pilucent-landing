'use client';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueries } from '@tanstack/react-query';
import {
  Search,
  ChevronsDownUp,
  ChevronsUpDown,
  RefreshCw,
  Printer,
  Download,
  Network,
} from 'lucide-react';
import { DeleteData, GetData } from '@/services/FetchMethods';
import { toastDeleteError } from '@/lib/helpers/apiErrors';
import Swal from 'sweetalert2';
import MainLoader from '@/components/MainLoader/MainLoader';
import ModalSM, { handleOpenModalSM } from '@/components/ModalSM/ModalSM';
import { useAppSelector } from '@/app/redux/store';
import { cn } from '@/lib/utils';
import { Breadcrumb, VioletButton, IconChip, money } from '@/components/violet';
import AddAccountForm from './AddAccountForm';
import UpdateAccount from './UpdateAccount';
import VioletTree from './VioletTree';
import {
  TYPE_META,
  type GroupType,
  countAccounts,
  sumBalance,
  pruneTree,
} from './treeUtils';

const CoaTree = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [UpdateUID, setUpdateUID] = useState('');
  const [UID, setUID] = useState('');
  const [isPending, setIsPending] = useState(true);
  const [isAddModal, setIsAddModal] = useState<boolean>(true);

  // ── UI-only view state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<GroupType | null>(null);
  const [expandOpen, setExpandOpen] = useState(false);
  const [expandVersion, setExpandVersion] = useState(0);
  const [asOf, setAsOf] = useState('');

  useEffect(() => {
    setAsOf(
      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    );
  }, []);

  const { Permissions } = useAppSelector((state) => state.Permissions);

  const [Equities, Assets, Expenses, Incomes, Liabilities] = useQueries({
    queries: [
      {
        queryKey: ['tree_data_list_view', 'equity'],
        queryFn: async () => {
          const response = await GetData(`we/chart-of-accounts/trees?kind=EQUITIES`, '');
          return [
            {
              _id: '5',
              title: 'Equity',
              code: 'G- Equity',
              children: [...response?.results],
            },
          ];
        },
      },
      {
        queryKey: ['tree_data_list_view', 'assets'],
        queryFn: async () => {
          const response = await GetData(`we/chart-of-accounts/trees?kind=ASSETS`, '');
          return [
            {
              _id: '1',
              title: 'Asset',
              code: 'G- Asset',
              children: [...response?.results],
            },
          ];
        },
      },
      {
        queryKey: ['tree_data_list_view', 'EXPENSES'],
        queryFn: async () => {
          const response = await GetData(`we/chart-of-accounts/trees?kind=EXPENSES`, '');
          return [
            {
              _id: '4',
              title: 'Expense',
              code: 'G- Expense',
              children: [...response?.results],
            },
          ];
        },
      },
      {
        queryKey: ['tree_data_list_view', 'INCOMES'],
        queryFn: async () => {
          const response = await GetData(`we/chart-of-accounts/trees?kind=INCOMES`, '');
          return [
            {
              _id: '3',
              title: 'Income',
              code: 'G- Income',
              children: [...response?.results],
            },
          ];
        },
      },
      {
        queryKey: ['tree_data_list_view', 'LIABILITIES'],
        queryFn: async () => {
          const response = await GetData(`we/chart-of-accounts/trees?kind=LIABILITIES`, '');
          return [
            {
              _id: '2',
              title: 'Liability',
              code: 'G- Liability',
              children: [...response?.results],
            },
          ];
        },
      },
    ],
  });

  const {
    data: AssetAccounts = [],
    isPending: isAssetPending,
    refetch: assetRefetch,
  } = Assets;
  const {
    data: IncomeAccounts = [],
    isPending: isIncomesLoading,
    refetch: incomeRefetch,
  } = Incomes;
  const {
    data: LiabilityAccounts = [],
    isPending: isLiabilityLoading,
    refetch: liabilityRefetch,
  } = Liabilities;
  const {
    data: ExpenseAccounts = [],
    isPending: isExpenseLoading,
    refetch: expenseRefetch,
  } = Expenses;
  const {
    data: EquityAccounts = [],
    isPending: isEquityLoading,
    refetch: equityRefetch,
  } = Equities;

  const Refetch = () => {
    assetRefetch();
    incomeRefetch();
    liabilityRefetch();
    expenseRefetch();
    equityRefetch();
  };

  const printTreeView = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      const printContent = printRef.current.innerHTML;

      // Get all styles from the main document
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
          } catch (error) {
            return ''; // Ignore cross-origin stylesheets
          }
        })
        .join('\n');

      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
        <html>
          <head>
            <style>${styles}</style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
        printWindow.document.close();

        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          // printWindow.close();
        };
      }
    }
  };

  const { mutate: DeleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: async (uid: any) => {
      const res = await DeleteData(`we/chart-of-accounts/${uid}`, '');
      return res;
    },
    onSuccess: (res) => {
      Swal.fire({
        title: 'Deleted!',
        text: 'Your Account has been deleted.',
        icon: 'success',
      });
      Refetch();
    },
    onError: (err: any) => {
      // 400 (control account / used as a parent) or 409 (has ledger history).
      toastDeleteError(err?.body ?? err?.message, err?.status);
    },
  });

  const MergeData = () => {
    const mergedData = [
      ...IncomeAccounts,
      ...AssetAccounts,
      ...ExpenseAccounts,
      ...EquityAccounts,
      ...LiabilityAccounts,
    ];
    return mergedData;
  };

  const exportToWord = () => {
    const data = MergeData();
    const treeContent = convertTreeToHTML(data);
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>";
    const footer = '</html>';
    const body = `<body>${treeContent}</body>`;
    const html = header + body + footer;

    const blob = new Blob(['﻿', html], {
      type: 'application/msword',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tree-structure.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertTreeToHTML = (nodes: any, level = 0) => {
    let html = '';
    nodes.forEach((node: any) => {
      html += `<div style="margin-left: ${level * 20}px; font-family: Arial, sans-serif;">`;
      html += `<span style="border-left: 2px solid green; padding-left: 5px; display: inline-block;"></span>`;
      html += `<span style="font-weight: bold; margin-left: 10px;">[${node?._id}] - ${node?.title} - ${node?.code}</span>`;
      if (node.children) {
        html += convertTreeToHTML(node.children, level + 1);
      }
      html += '</div>';
    });
    return html;
  };

  const handleAdd = (uid: string) => {
    setUID(uid);
    setIsAddModal(true);
    handleOpenModalSM();
  };
  const handleEdit = (uid: string) => {
    setUpdateUID(uid);
    setIsAddModal(false);
    handleOpenModalSM();
  };

  const handleDelete = (uid: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#00035F',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        DeleteAccount(uid);
      }
    });
  };

  // Delete failures are rendered by the mutation's own onError above, which has
  // the HTTP status and so can tell 409 from 400.

  useEffect(() => {
    if (
      !isExpenseLoading &&
      !isEquityLoading &&
      !isAssetPending &&
      !isIncomesLoading &&
      !isLiabilityLoading
    ) {
      setIsPending(false);
    }
  }, [isExpenseLoading, isEquityLoading, isAssetPending, isIncomesLoading, isLiabilityLoading]);

  /* ── derive view model (UI only) ── */
  const groups: { type: GroupType; root: any }[] = [
    { type: 'Asset', root: AssetAccounts?.[0] },
    { type: 'Liability', root: LiabilityAccounts?.[0] },
    { type: 'Equity', root: EquityAccounts?.[0] },
    { type: 'Income', root: IncomeAccounts?.[0] },
    { type: 'Expense', root: ExpenseAccounts?.[0] },
  ];

  const search = searchTerm.trim();
  const searchActive = search.length > 0;
  const rendered = groups
    .filter((g) => g.root && (!typeFilter || g.type === typeFilter))
    .map((g) => ({ ...g, pruned: pruneTree(g.root, search) }))
    .filter((g) => g.pruned);

  const visibleCount = rendered.reduce((acc, g) => acc + countAccounts(g.pruned), 0);
  const totalAccounts = groups.reduce((acc, g) => acc + countAccounts(g.root), 0);

  const expandAllNow = () => {
    setExpandOpen(true);
    setExpandVersion((v) => v + 1);
  };
  const collapseAllNow = () => {
    setExpandOpen(false);
    setExpandVersion((v) => v + 1);
  };

  return (
    <div className="font-jakarta text-v-ink900">
      {isDeleting && <MainLoader className="h-[50vh]" color="#9ca3af" />}

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Transactions' },
          { label: 'COA tree' },
        ]}
      />

      {/* Header */}
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            COA tree
          </h1>
          <p className="mt-0.5 text-[13.5px] text-v-ink500">
            Your chart of accounts, organised the way the books actually nest.
          </p>
        </div>
        <span className="flex-1" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search account or code"
              className="w-[230px] rounded-xl border border-white/75 bg-white/60 py-2.5 pl-9 pr-3 text-[13px] text-v-ink900 outline-none backdrop-blur-md transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
            />
          </div>
          <VioletButton variant="secondary" size="sm" leftIcon={<ChevronsUpDown className="h-4 w-4" />} onClick={expandAllNow}>
            Expand all
          </VioletButton>
          <VioletButton variant="secondary" size="sm" leftIcon={<ChevronsDownUp className="h-4 w-4" />} onClick={collapseAllNow}>
            Collapse all
          </VioletButton>
          <VioletButton variant="secondary" size="icon" title="Refresh" onClick={() => Refetch()}>
            <RefreshCw className="h-4 w-4" />
          </VioletButton>
          <VioletButton variant="secondary" size="icon" title="Print" onClick={printTreeView}>
            <Printer className="h-4 w-4" />
          </VioletButton>
          <VioletButton variant="primary" size="md" leftIcon={<Download className="h-4 w-4" />} onClick={exportToWord}>
            Export
          </VioletButton>
        </div>
      </div>

      {/* Type summary cards */}
      <div className="mt-[18px] grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {isPending
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[94px] animate-pulse rounded-2xl border-[1.5px] border-v-border bg-white shadow-v-card"
              />
            ))
          : groups.map((g) => {
          const meta = TYPE_META[g.type];
          const count = countAccounts(g.root);
          const net = sumBalance(g.root);
          const active = typeFilter === g.type;
          return (
            <button
              key={g.type}
              type="button"
              onClick={() => setTypeFilter(active ? null : g.type)}
              className={cn(
                'rounded-2xl border-[1.5px] bg-white p-4 text-left shadow-v-card transition-all duration-150 hover:-translate-y-0.5',
                active ? 'border-transparent' : 'border-v-border'
              )}
              style={
                active
                  ? { borderColor: meta.swatch, boxShadow: `0 12px 26px -16px ${meta.swatch}` }
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-[9px] w-[9px] rounded-[3px]"
                  style={{ background: meta.swatch }}
                />
                <span className="text-[12.5px] font-bold text-v-ink900">{meta.label}</span>
                <span className="flex-1" />
                <span className="rounded-full bg-v-wash2 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-v-ink500">
                  {count}
                </span>
              </div>
              <div
                className={cn(
                  'mt-2 text-[18px] font-extrabold tracking-[-0.02em] tabular-nums',
                  net === 0 ? 'text-v-ink400' : net < 0 ? 'text-[#D2483E]' : 'text-v-ink900'
                )}
              >
                {money(net)}
              </div>
              <div className="text-[11px] text-v-ink400">net balance</div>
            </button>
          );
        })}
      </div>

      {/* Hierarchy card */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        {/* header */}
        <div className="flex items-center gap-2.5 px-[22px] pb-3 pt-4">
          <IconChip tone="violet">
            <Network />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-v-ink900">Account hierarchy</div>
            <div className="text-[11.5px] text-v-ink400">
              Expand a branch to see how the books nest.
            </div>
          </div>
          <span className="flex-1" />
          <span className="rounded-full bg-v-wash2 px-2.5 py-1 text-[11px] font-bold tabular-nums text-v-ink500">
            {visibleCount} visible
          </span>
        </div>

        {/* column strip */}
        <div className="flex items-center border-y border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2 text-[12px] font-semibold text-v-ink400">
          <span className="pl-[40px]">Account</span>
          <span className="flex-1" />
          <span>Balance</span>
        </div>

        {/* rows */}
        {isPending ? (
          <div className="flex h-[40vh] items-center justify-center">
            <MainLoader size={64} color="#7C4DFF" />
          </div>
        ) : rendered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <Search className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-semibold text-v-ink900">
              {searchActive ? `No accounts match “${search}”` : 'No accounts to show'}
            </div>
            <div className="text-[13px] text-v-ink400">
              Try a different name or account code.
            </div>
          </div>
        ) : (
          rendered.map((g) => (
            <VioletTree
              key={g.type}
              node={g.pruned}
              depth={0}
              swatch={TYPE_META[g.type].swatch}
              expandVersion={expandVersion}
              expandOpen={expandOpen}
              searchActive={searchActive}
              permissions={Permissions || []}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}

        {/* footer */}
        <div className="flex items-center px-[22px] py-3 text-[12px] text-v-ink400">
          <span className="tabular-nums">{totalAccounts} accounts</span>
          <span className="flex-1" />
          {asOf && <span>Balances as of {asOf}</span>}
        </div>
      </div>

      {/* hidden fully-expanded copy for Print */}
      <div className="hidden" ref={printRef} aria-hidden>
        {groups
          .filter((g) => g.root)
          .map((g) => (
            <VioletTree
              key={g.type}
              node={g.root}
              depth={0}
              swatch={TYPE_META[g.type].swatch}
              expandVersion={0}
              expandOpen
              searchActive
              permissions={[]}
            />
          ))}
      </div>

      <ModalSM title="Account" edit={false}>
        {isAddModal ? (
          <AddAccountForm parentUID={UID} refetchTreeData={Refetch} />
        ) : (
          <UpdateAccount refetch={Refetch} uid={UpdateUID} />
        )}
      </ModalSM>
    </div>
  );
};

export default CoaTree;
