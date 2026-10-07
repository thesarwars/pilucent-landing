'use client';

import { useMemo, useState } from 'react';
import Table from '@/app/(admin)/_components/Table';
import {
  SBadge,
  Mono,
  MiniBar,
  SBtn,
  SField,
  SInput,
  SSelect,
  STextarea,
  SCheckbox,
  SDateTime,
} from '../_components/ui';
import { TicketPercent, Gift } from 'lucide-react';
import { SDrawer } from '../_components/overlays';
import { useSa } from '../_components/SaProvider';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchSubscriptionCoupons,
  fetchSubscriptionOffers,
  fetchSubscriptions,
  postSubscriptionCoupon,
  postSubscriptionOffer,
  patchSubscriptionCoupon,
  patchSubscriptionOffer,
  deleteSubscriptionCoupon,
  deleteSubscriptionOffer,
} from '@/app/helpers/backend';
import {
  mapCouponsTableData,
  mapOffersTableData,
  buildCouponPayload,
  buildOfferPayload,
  couponFormFromApi,
  offerFormFromApi,
  emptyCouponForm,
  emptyOfferForm,
  normalizeList,
  type ApiCoupon,
  type ApiOffer,
  type CouponFormState,
  type CouponTableRow,
  type OfferFormState,
  type OfferTableRow,
} from '../_components/promotions';

const CouponColumns = [
  {
    text: 'Code',
    dataField: 'code',
    formatter: (v: string) => (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FCF1DD]">
          <TicketPercent className="h-3.5 w-3.5 text-[#9A6A0B]" />
        </span>
        <Mono>{v}</Mono>
      </div>
    ),
  },
  { text: 'Type', dataField: 'type' },
  { text: 'Value', dataField: 'value', formatter: (v: string) => <Mono>{v}</Mono> },
  { text: 'Eligibility', dataField: 'eligibility' },
  {
    text: 'Redemptions',
    dataField: 'redemptions',
    formatter: (v: CouponTableRow['redemptions']) => {
      const displayMax = v.max === 0 ? '∞' : String(v.max);
      const barValue = v.max === 0 ? Math.min(100, v.used * 4) : (v.used / v.max) * 100;
      return (
        <div className="min-w-[80px]">
          <Mono>{v.used} / {displayMax}</Mono>
          <MiniBar value={barValue} tone="brand" className="mt-1.5" />
        </div>
      );
    },
  },
  { text: 'Stackable', dataField: 'stackable' },
  {
    text: 'Status',
    dataField: 'status',
    formatter: (v: CouponTableRow['status']) => <SBadge tone={v.tone}>{v.label}</SBadge>,
  },
  { text: 'Ends', dataField: 'ends', formatter: (v: string) => <Mono>{v}</Mono> },
];

const OfferColumns = [
  {
    text: 'Code',
    dataField: 'code',
    formatter: (v: string) => (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFEAFE]">
          <Gift className="h-3.5 w-3.5 text-[#5B5BF0]" />
        </span>
        <Mono>{v}</Mono>
      </div>
    ),
  },
  { text: 'Title', dataField: 'title' },
  { text: 'Description', dataField: 'description' },
  {
    text: 'Status',
    dataField: 'status',
    formatter: (v: OfferTableRow['status']) => <SBadge tone={v.tone}>{v.label}</SBadge>,
  },
  { text: 'Retention', dataField: 'retention' },
  { text: 'Linked Coupon', dataField: 'linkedCoupon', formatter: (v: string) => <Mono>{v}</Mono> },
  { text: 'Ends', dataField: 'ends', formatter: (v: string) => <Mono>{v}</Mono> },
];

const COUPON_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const OFFER_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const DISCOUNT_KIND_OPTIONS = [
  { value: 'FLAT', label: 'Flat amount' },
  { value: 'PERCENTAGE', label: 'Percentage' },
];

export default function Page() {
  const { toast, confirm } = useSa();
  const [couponOpen, setCouponOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<CouponFormState>(emptyCouponForm);
  const [offerForm, setOfferForm] = useState<OfferFormState>(emptyOfferForm);
  const [couponSaving, setCouponSaving] = useState(false);
  const [offerSaving, setOfferSaving] = useState(false);
  const [couponEditUid, setCouponEditUid] = useState<string | null>(null);
  const [offerEditUid, setOfferEditUid] = useState<string | null>(null);

  const {
    data: couponsRaw,
    setQueryParams: setCouponParams,
    isPending: couponsLoading,
    refetch: refetchCoupons,
  } = useFetch(['subscription-coupons'], fetchSubscriptionCoupons);

  const {
    data: offersRaw,
    setQueryParams: setOfferParams,
    isPending: offersLoading,
    refetch: refetchOffers,
  } = useFetch(['subscription-offers'], fetchSubscriptionOffers);

  const { data: plansData } = useFetch(['subscriptionData'], fetchSubscriptions);

  const couponsData = useMemo(() => mapCouponsTableData(couponsRaw), [couponsRaw]);
  const offersData = useMemo(() => mapOffersTableData(offersRaw), [offersRaw]);

  const plans = useMemo(() => {
    const list = plansData?.results ?? plansData?.data ?? (Array.isArray(plansData) ? plansData : []);
    return Array.isArray(list) ? list : [];
  }, [plansData]);

  const couponOptions = useMemo(() => {
    const list = normalizeList(couponsRaw).results as { uid: string; code: string }[];
    return [
      { value: '', label: 'No linked coupon' },
      ...list.map(c => ({ value: c.uid, label: c.code })),
    ];
  }, [couponsRaw]);

  const togglePlanUid = (uid: string) => {
    setCouponForm(f => ({
      ...f,
      plan_uids: f.plan_uids.includes(uid)
        ? f.plan_uids.filter(id => id !== uid)
        : [...f.plan_uids, uid],
    }));
  };

  const errMessage = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string; detail?: string } } })?.response?.data?.message ??
    (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
    fallback;

  const openCreateCoupon = () => {
    setCouponEditUid(null);
    setCouponForm(emptyCouponForm());
    setCouponOpen(true);
  };

  const openEditCoupon = (row: CouponTableRow) => {
    const raw = (normalizeList(couponsRaw).results as ApiCoupon[]).find(c => c.uid === row.uid);
    if (!raw) {
      toast('Not found', 'Could not load this coupon.', 'bad');
      return;
    }
    setCouponEditUid(raw.uid);
    setCouponForm(couponFormFromApi(raw));
    setCouponOpen(true);
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim() || !couponForm.discount_value.trim()) {
      toast('Missing fields', 'Coupon code and discount value are required.', 'bad');
      return;
    }
    setCouponSaving(true);
    try {
      if (couponEditUid) {
        await patchSubscriptionCoupon(couponEditUid, buildCouponPayload(couponForm));
        toast('Coupon updated', `${couponForm.code} has been updated.`, 'good');
      } else {
        await postSubscriptionCoupon(buildCouponPayload(couponForm));
        toast('Coupon created', `${couponForm.code} is now live.`, 'good');
      }
      setCouponForm(emptyCouponForm());
      setCouponEditUid(null);
      setCouponOpen(false);
      refetchCoupons();
    } catch (err: unknown) {
      toast(
        couponEditUid ? 'Update failed' : 'Create failed',
        String(errMessage(err, 'Could not save coupon.')),
        'bad'
      );
    } finally {
      setCouponSaving(false);
    }
  };

  const handleDeleteCoupon = (row: CouponTableRow) => {
    confirm({
      title: 'Delete coupon',
      message: `Delete coupon "${row.code}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteSubscriptionCoupon(row.uid);
          toast('Coupon deleted', `${row.code} has been removed.`, 'good');
          refetchCoupons();
        } catch (err: unknown) {
          toast('Delete failed', String(errMessage(err, 'Could not delete coupon.')), 'bad');
        }
      },
    });
  };

  const openCreateOffer = () => {
    setOfferEditUid(null);
    setOfferForm(emptyOfferForm());
    setOfferOpen(true);
  };

  const openEditOffer = (row: OfferTableRow) => {
    const raw = (normalizeList(offersRaw).results as ApiOffer[]).find(o => o.uid === row.uid);
    if (!raw) {
      toast('Not found', 'Could not load this offer.', 'bad');
      return;
    }
    setOfferEditUid(raw.uid);
    setOfferForm(offerFormFromApi(raw));
    setOfferOpen(true);
  };

  const handleSaveOffer = async () => {
    if (!offerForm.code.trim() || !offerForm.title.trim()) {
      toast('Missing fields', 'Offer code and title are required.', 'bad');
      return;
    }
    setOfferSaving(true);
    try {
      if (offerEditUid) {
        await patchSubscriptionOffer(offerEditUid, buildOfferPayload(offerForm));
        toast('Offer updated', `${offerForm.title} has been updated.`, 'good');
      } else {
        await postSubscriptionOffer(buildOfferPayload(offerForm));
        toast('Offer created', `${offerForm.title} has been saved.`, 'good');
      }
      setOfferForm(emptyOfferForm());
      setOfferEditUid(null);
      setOfferOpen(false);
      refetchOffers();
    } catch (err: unknown) {
      toast(
        offerEditUid ? 'Update failed' : 'Create failed',
        String(errMessage(err, 'Could not save offer.')),
        'bad'
      );
    } finally {
      setOfferSaving(false);
    }
  };

  const handleDeleteOffer = (row: OfferTableRow) => {
    confirm({
      title: 'Delete offer',
      message: `Delete offer "${row.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteSubscriptionOffer(row.uid);
          toast('Offer deleted', `${row.title} has been removed.`, 'good');
          refetchOffers();
        } catch (err: unknown) {
          toast('Delete failed', String(errMessage(err, 'Could not delete offer.')), 'bad');
        }
      },
    });
  };

  const previewBase = 250;
  const previewDiscount =
    couponForm.discount_kind === 'PERCENTAGE'
      ? (previewBase * (Number(couponForm.discount_value) || 0)) / 100
      : Number(couponForm.discount_value) || 0;
  const previewTotal = Math.max(0, previewBase - previewDiscount);

  return (
    <div className="space-y-6">
      <Table
        columns={CouponColumns}
        data={couponsData}
        setParams={setCouponParams}
        loading={couponsLoading}
        title="Coupons"
        isCheckbox={false}
        isSearch={false}
        isSettings={false}
        isPdfExcel={false}
        pagination={true}
        isScreen={false}
        isView={false}
        onEdit={openEditCoupon}
        onDelete={handleDeleteCoupon}
      >
        <SBtn onClick={openCreateCoupon}>New Coupon</SBtn>
      </Table>

      <Table
        columns={OfferColumns}
        data={offersData}
        setParams={setOfferParams}
        loading={offersLoading}
        title="Offers"
        isCheckbox={false}
        isSearch={false}
        isSettings={false}
        isPdfExcel={false}
        pagination={true}
        isScreen={false}
        isView={false}
        onEdit={openEditOffer}
        onDelete={handleDeleteOffer}
      >
        <SBtn onClick={openCreateOffer}>New Offer</SBtn>
      </Table>

      <SDrawer
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        title={couponEditUid ? 'Edit Coupon' : 'Create Coupon'}
        width={620}
        footer={
          <div className="flex justify-end gap-2">
            <SBtn variant="ghost" onClick={() => setCouponOpen(false)} disabled={couponSaving}>
              Cancel
            </SBtn>
            <SBtn onClick={handleSaveCoupon} disabled={couponSaving}>
              {couponSaving
                ? couponEditUid
                  ? 'Saving…'
                  : 'Creating…'
                : couponEditUid
                  ? 'Save Changes'
                  : 'Create Coupon'}
            </SBtn>
          </div>
        }
      >
        <div className="space-y-4">
          <SField label="Code">
            <SInput
              value={couponForm.code}
              onChange={v => setCouponForm(f => ({ ...f, code: v }))}
              placeholder="Balanzify20"
              mono
            />
          </SField>
          <div className="grid gap-4 sm:grid-cols-2">
            <SField label="Status">
              <SSelect
                value={couponForm.status}
                onChange={v => setCouponForm(f => ({ ...f, status: v }))}
                options={COUPON_STATUS_OPTIONS}
              />
            </SField>
            <SField label="Discount kind">
              <SSelect
                value={couponForm.discount_kind}
                onChange={v => setCouponForm(f => ({ ...f, discount_kind: v }))}
                options={DISCOUNT_KIND_OPTIONS}
              />
            </SField>
          </div>
          <SField label="Discount value">
            <SInput
              value={couponForm.discount_value}
              onChange={v => setCouponForm(f => ({ ...f, discount_value: v }))}
              placeholder={couponForm.discount_kind === 'PERCENTAGE' ? '20' : '40.00'}
              mono
            />
          </SField>
          <div className="grid gap-4 sm:grid-cols-2">
            <SField label="Max redemptions">
              <SInput
                value={couponForm.max_redemptions}
                onChange={v => setCouponForm(f => ({ ...f, max_redemptions: v }))}
                placeholder="100"
                mono
              />
            </SField>
            <SField label="Max redemptions per company">
              <SInput
                value={couponForm.max_redemptions_per_company}
                onChange={v => setCouponForm(f => ({ ...f, max_redemptions_per_company: v }))}
                placeholder="5"
                mono
              />
            </SField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SField label="Valid from">
              <SDateTime
                value={couponForm.valid_from}
                onChange={v => setCouponForm(f => ({ ...f, valid_from: v }))}
              />
            </SField>
            <SField label="Valid until">
              <SDateTime
                value={couponForm.valid_until}
                onChange={v => setCouponForm(f => ({ ...f, valid_until: v }))}
              />
            </SField>
          </div>
          <SCheckbox
            checked={couponForm.is_stackable}
            onChange={v => setCouponForm(f => ({ ...f, is_stackable: v }))}
            label="Is stackable"
          />
          <SField label="Notes">
            <STextarea
              value={couponForm.notes}
              onChange={v => setCouponForm(f => ({ ...f, notes: v }))}
              placeholder="Internal notes"
            />
          </SField>
          <SField label="Applies to subscription plans" hint="Leave empty to apply to all plans">
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-[11px] border border-[#E7E8F2] bg-white p-3">
              {plans.length === 0 ? (
                <p className="text-[12px] text-[#9AA0BF]">No plans loaded</p>
              ) : (
                plans.map((plan: { uid: string; title: string }) => (
                  <SCheckbox
                    key={plan.uid}
                    checked={couponForm.plan_uids.includes(plan.uid)}
                    onChange={() => togglePlanUid(plan.uid)}
                    label={plan.title}
                  />
                ))
              )}
            </div>
          </SField>

          <div className="rounded-2xl bg-[linear-gradient(155deg,#0B1020,#171a3a)] p-5 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">Live preview</p>
            <div className="mt-3 space-y-2 font-mono text-[13px]">
              <div className="flex justify-between text-white/70">
                <span>Base plan</span>
                <span>${previewBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#F2415A]">
                <span>Discount</span>
                <span>−${previewDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="font-semibold">First invoice</span>
                <span className="text-[22px] font-extrabold text-[#2FE0C8]">${previewTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </SDrawer>

      <SDrawer
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        title={offerEditUid ? 'Edit Offer' : 'Create Offer'}
        width={620}
        footer={
          <div className="flex justify-end gap-2">
            <SBtn variant="ghost" onClick={() => setOfferOpen(false)} disabled={offerSaving}>
              Cancel
            </SBtn>
            <SBtn onClick={handleSaveOffer} disabled={offerSaving}>
              {offerSaving
                ? offerEditUid
                  ? 'Saving…'
                  : 'Creating…'
                : offerEditUid
                  ? 'Save Changes'
                  : 'Create Offer'}
            </SBtn>
          </div>
        }
      >
        <div className="space-y-4">
          <SField label="Code">
            <SInput
              value={offerForm.code}
              onChange={v => setOfferForm(f => ({ ...f, code: v }))}
              placeholder="code1013"
              mono
            />
          </SField>
          <SField label="Title">
            <SInput
              value={offerForm.title}
              onChange={v => setOfferForm(f => ({ ...f, title: v }))}
              placeholder="Balanzify Promo Code"
            />
          </SField>
          <SField label="Description">
            <STextarea
              value={offerForm.description}
              onChange={v => setOfferForm(f => ({ ...f, description: v }))}
              placeholder="This is the balanzify promo code"
            />
          </SField>
          <SField label="Status">
            <SSelect
              value={offerForm.status}
              onChange={v => setOfferForm(f => ({ ...f, status: v }))}
              options={OFFER_STATUS_OPTIONS}
            />
          </SField>
          <SField label="Linked coupon">
            <SSelect
              value={offerForm.coupon}
              onChange={v => setOfferForm(f => ({ ...f, coupon: v }))}
              options={couponOptions}
            />
          </SField>
          <SCheckbox
            checked={offerForm.is_retention_offer}
            onChange={v => setOfferForm(f => ({ ...f, is_retention_offer: v }))}
            label="Is retention offer"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SField label="Valid from">
              <SDateTime
                value={offerForm.valid_from}
                onChange={v => setOfferForm(f => ({ ...f, valid_from: v }))}
              />
            </SField>
            <SField label="Valid until">
              <SDateTime
                value={offerForm.valid_until}
                onChange={v => setOfferForm(f => ({ ...f, valid_until: v }))}
              />
            </SField>
          </div>
        </div>
      </SDrawer>
    </div>
  );
}
