'use client';
import React, { useEffect, useState } from 'react';
import { Bookmark, Check, ChevronDown, Loader2 } from 'lucide-react';
import { fetchLeaveType, patchLeaveType, postLeaveType } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { Drawer, VioletButton } from '@/components/violet';
import { cn } from '@/lib/utils';
import LogoLoader from '@/components/MainLoader/logo-loader';

const FORM_ID = 'leave-type-form';

const FIELD =
  'w-full rounded-[11px] border border-v-border bg-white px-3.5 py-2.5 text-[13px] font-medium text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const LABEL = 'mb-1.5 block text-[12px] font-semibold text-v-ink700';
const CARD = 'rounded-[16px] bg-white p-[18px_20px] shadow-v-card';
const GRID = 'grid grid-cols-1 gap-x-[22px] gap-y-3.5 sm:grid-cols-2';

const SWATCHES = ['#02f785', '#7C4DFF', '#F5B22E', '#22D3EE', '#F472B6', '#1FA97A'];

/** 22px tick box used by the collapsible rule-section headers. */
function CheckBox({ checked, size = 22 }: { checked: boolean; size?: number }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[7px] border-[1.5px] transition-colors',
        checked ? 'border-v-primary bg-v-primary text-white' : 'border-v-border bg-white',
      )}
      style={{ width: size, height: size }}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3.2} />}
    </span>
  );
}

/** A native select with a custom chevron, matching the spec inputs. */
function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD, 'cursor-pointer appearance-none pr-9')}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-v-ink400" />
    </div>
  );
}

/** Collapsible rule section: checkbox header reveals its field grid when on. */
function RuleSection({
  checked,
  onToggle,
  title,
  hint,
  children,
}: {
  checked: boolean;
  onToggle: (v: boolean) => void;
  title: string;
  hint: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={CARD}>
      <button
        type="button"
        onClick={() => onToggle(!checked)}
        className="flex w-full items-start gap-3 text-left"
      >
        <CheckBox checked={checked} />
        <div className="min-w-0">
          <div className="text-[13.5px] font-extrabold text-v-ink900">{title}</div>
          <div className="text-[11.5px] text-v-ink400">{hint}</div>
        </div>
      </button>
      {checked && children && <div className={cn('mt-4 animate-v-pop', GRID)}>{children}</div>}
    </div>
  );
}

/** Flag toggle-card: tints violet when on. */
function FlagCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center gap-2.5 rounded-[12px] border-[1.5px] px-3.5 py-3 text-left transition-colors',
        checked ? 'border-v-primary bg-[#F8F5FF]' : 'border-v-border bg-white hover:border-[#B49AFF]',
      )}
    >
      <CheckBox checked={checked} size={20} />
      <span className="text-[12.5px] font-semibold text-v-ink800">{label}</span>
    </button>
  );
}

const Leave = ({
  isOpen,
  setIsOpen,
  refetch,
  uid,
}: {
  isOpen: boolean;
  setIsOpen: any;
  refetch?: any;
  uid?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [leaveData, setLeaveData] = useState({
    maximum_allocation_hours: 8,
    name: '',
    display_name: '',
    definition: '',
    color: '',
    maximum_allocation: '',
    allow_after_working_days: '',
    max_consecutive_allowed: '',
    leave_type: 'DAILY',
    is_carry_forward: false,
    max_carry_forwarded: '',
    carry_expiry_days: '',
    is_encashable: false,
    max_encashable: '',
    min_encashable: '',
    earning_components: '',
    is_earned_leave: false,
    earned_leave_frequency: '',
    allocate_on_day: '',
    rounders: '',
    is_partially_paid: false,
    fraction_salary_per_leave: '',
    is_leave_without_pay: false,
    allow_negative_balance: false,
    include_holidays_within_leave: false,
    is_optional_leave: false,
    allow_over_allocation: false,
    is_compensatory: false,
    is_active: false,
    status: 'ACTIVE',
  });

  const handleReset = () => {
    setLeaveData({
      maximum_allocation_hours: 8,
      name: '',
      display_name: '',
      definition: '',
      color: '',
      maximum_allocation: '',
      allow_after_working_days: '',
      max_consecutive_allowed: '',
      leave_type: 'DAILY',
      is_carry_forward: false,
      max_carry_forwarded: '',
      carry_expiry_days: '',
      is_encashable: false,
      max_encashable: '',
      min_encashable: '',
      earning_components: '',
      is_earned_leave: false,
      earned_leave_frequency: '',
      allocate_on_day: '',
      rounders: '',
      is_partially_paid: false,
      fraction_salary_per_leave: '',
      is_leave_without_pay: false,
      allow_negative_balance: false,
      include_holidays_within_leave: false,
      is_optional_leave: false,
      allow_over_allocation: false,
      is_compensatory: false,
      is_active: false,
      status: 'ACTIVE',
    });
  };

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchLeaveType(uid);
          if (res) {
            setLeaveData({ ...leaveData, ...res });
          }
        } catch (error) {
          //error
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      handleReset();
    }
  }, [uid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsPending(true);
      if (uid) {
        const res = await patchLeaveType(uid, {
          ...leaveData,
          max_carry_forwarded: leaveData?.max_carry_forwarded || 0,
          carry_expiry_days: leaveData?.carry_expiry_days || 0,
          max_encashable: leaveData?.max_encashable || 0,
          min_encashable: leaveData?.min_encashable || 0,
          fraction_salary_per_leave: leaveData?.fraction_salary_per_leave || 0,
        });
        if (res?.success) {
          toast.success('Leave type updated.');
          handleReset();
          refetch && refetch();
          setIsOpen(false);
        }
      } else {
        const res = await postLeaveType({
          ...leaveData,
          max_carry_forwarded: leaveData?.max_carry_forwarded || 0,
          carry_expiry_days: leaveData?.carry_expiry_days || 0,
          max_encashable: leaveData?.max_encashable || 0,
          min_encashable: leaveData?.min_encashable || 0,
          fraction_salary_per_leave: leaveData?.fraction_salary_per_leave || 0,
        });
        if (res?.success) {
          toast.success('Leave type created.');
          handleReset();
          refetch && refetch();
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error('Error creating leave type:', error);
    } finally {
      setIsPending(false);
    }
  };

  const nameFilled = !!`${leaveData.name || ''}`.trim();

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<Bookmark />}
      title={uid ? 'Edit leave type' : 'New leave type'}
      sub="Allocation, carry-forward, encashment & pay rules"
      width={600}
      className="bg-[#F4F2FA]"
      footer={
        <>
          <span className="flex-1" />
          <VioletButton
            type="button"
            variant="outline"
            className="min-w-[120px]"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </VioletButton>
          <VioletButton
            type="submit"
            form={FORM_ID}
            variant="primary"
            className="min-w-[160px]"
            disabled={isPending || !nameFilled}
            leftIcon={
              isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />
            }
          >
            {isPending ? 'Saving…' : uid ? 'Save changes' : 'Save leave type'}
          </VioletButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <LogoLoader size={100} color={'#16151c'} />
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={handleSave} className="flex flex-col gap-3.5">
          {/* Card 1 — Leave type info */}
          <div className={CARD}>
            <div className="mb-4 text-[13.5px] font-extrabold text-v-ink900">Leave type info</div>
            <div className={GRID}>
              <div>
                <label className={LABEL}>
                  Leave type name <span className="text-v-primary">*</span>
                </label>
                <input
                  type="text"
                  value={leaveData.name}
                  onChange={(e) =>
                    setLeaveData({
                      ...leaveData,
                      name: e.target.value,
                      display_name: leaveData?.display_name ? leaveData?.display_name : e.target.value,
                    })
                  }
                  required
                  className={FIELD}
                />
              </div>
              <div>
                <label className={LABEL}>Maximum allocation per leave period</label>
                <input
                  type="number"
                  value={leaveData.maximum_allocation}
                  onChange={(e) => setLeaveData({ ...leaveData, maximum_allocation: e.target.value })}
                  className={cn(FIELD, 'tabular-nums')}
                />
              </div>
              <div>
                <label className={LABEL}>Display name</label>
                <input
                  type="text"
                  value={leaveData.display_name}
                  onChange={(e) => setLeaveData({ ...leaveData, display_name: e.target.value })}
                  className={FIELD}
                />
              </div>
              <div>
                <label className={LABEL}>Allow leave application after (working days)</label>
                <input
                  type="number"
                  value={leaveData.allow_after_working_days}
                  onChange={(e) =>
                    setLeaveData({ ...leaveData, allow_after_working_days: e.target.value })
                  }
                  required
                  className={cn(FIELD, 'tabular-nums')}
                />
              </div>
              <div>
                <label className={LABEL}>Definition</label>
                <input
                  type="text"
                  value={leaveData.definition}
                  onChange={(e) => setLeaveData({ ...leaveData, definition: e.target.value })}
                  required
                  className={FIELD}
                />
              </div>
              <div>
                <label className={LABEL}>Maximum consecutive leave allowed</label>
                <input
                  type="number"
                  value={leaveData.max_consecutive_allowed}
                  onChange={(e) =>
                    setLeaveData({ ...leaveData, max_consecutive_allowed: e.target.value })
                  }
                  required
                  className={cn(FIELD, 'tabular-nums')}
                />
              </div>
              <div>
                <label className={LABEL}>Color</label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {SWATCHES.map((c) => {
                    const active = `${leaveData.color}`.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Color ${c}`}
                        onClick={() => setLeaveData({ ...leaveData, color: c })}
                        className="h-[26px] w-[26px] rounded-[8px] transition-shadow"
                        style={{
                          backgroundColor: c,
                          boxShadow: active ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${c}` : 'none',
                        }}
                      />
                    );
                  })}
                  {/* custom color */}
                  <label
                    className="relative flex h-[26px] w-[26px] cursor-pointer items-center justify-center overflow-hidden rounded-[8px] border border-v-border"
                    title="Custom color"
                    style={{ backgroundColor: leaveData.color || '#FFFFFF' }}
                  >
                    {!leaveData.color && <span className="text-[13px] font-bold text-v-ink400">+</span>}
                    <input
                      type="color"
                      value={leaveData.color || '#7C4DFF'}
                      onChange={(e) => setLeaveData({ ...leaveData, color: e.target.value })}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className={LABEL}>Leave type</label>
                <Select
                  value={leaveData.leave_type}
                  onChange={(v) => setLeaveData({ ...leaveData, leave_type: v })}
                >
                  <option value="DAILY">Daily</option>
                  <option value="HOURLY">Hourly</option>
                </Select>
                {leaveData?.leave_type == 'HOURLY' && (
                  <div className="mt-3">
                    <label className={LABEL}>Maximum allocation hours</label>
                    <input
                      min={1}
                      max={8}
                      type="number"
                      value={leaveData?.maximum_allocation_hours}
                      onChange={(e) =>
                        setLeaveData({ ...leaveData, maximum_allocation_hours: e.target.value as any })
                      }
                      required
                      className={cn(FIELD, 'tabular-nums')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2 — Carry forward */}
          <RuleSection
            checked={leaveData.is_carry_forward}
            onToggle={(v) => setLeaveData({ ...leaveData, is_carry_forward: v })}
            title="Carry forward?"
            hint="Unused leaves roll into the next period"
          >
            <div>
              <label className={LABEL}>Maximum carry forwarded leaves</label>
              <input
                type="number"
                value={leaveData.max_carry_forwarded}
                onChange={(e) => setLeaveData({ ...leaveData, max_carry_forwarded: e.target.value })}
                className={cn(FIELD, 'tabular-nums')}
              />
            </div>
            <div>
              <label className={LABEL}>Expire carry forwarded leaves (days)</label>
              <input
                type="number"
                value={leaveData.carry_expiry_days}
                onChange={(e) => setLeaveData({ ...leaveData, carry_expiry_days: e.target.value })}
                className={cn(FIELD, 'tabular-nums')}
              />
            </div>
          </RuleSection>

          {/* Card 3 — Encashment */}
          <RuleSection
            checked={leaveData.is_encashable}
            onToggle={(v) => setLeaveData({ ...leaveData, is_encashable: v })}
            title="Encashment"
            hint="Convert unused leaves to pay"
          >
            <div>
              <label className={LABEL}>Maximum encashable leaves</label>
              <input
                type="text"
                value={leaveData.max_encashable}
                onChange={(e) => setLeaveData({ ...leaveData, max_encashable: e.target.value })}
                className={cn(FIELD, 'tabular-nums')}
              />
            </div>
            <div>
              <label className={LABEL}>Minimum encashable leaves</label>
              <input
                type="text"
                value={leaveData.min_encashable}
                onChange={(e) => setLeaveData({ ...leaveData, min_encashable: e.target.value })}
                className={cn(FIELD, 'tabular-nums')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Earning components</label>
              <Select
                value={leaveData.earning_components}
                onChange={(v) => setLeaveData({ ...leaveData, earning_components: v })}
              >
                <option value="">Select earning components</option>
                <option value="basic">Basic</option>
                <option value="hra">HRA</option>
                <option value="all">All Components</option>
              </Select>
            </div>
          </RuleSection>

          {/* Card 4 — Earned leave */}
          <RuleSection
            checked={leaveData.is_earned_leave}
            onToggle={(v) => setLeaveData({ ...leaveData, is_earned_leave: v })}
            title="Earned leave?"
            hint="Accrues gradually over time"
          >
            <div>
              <label className={LABEL}>Earned leave frequency</label>
              <input
                type="text"
                value={leaveData.earned_leave_frequency}
                onChange={(e) =>
                  setLeaveData({ ...leaveData, earned_leave_frequency: e.target.value })
                }
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Allocate on day</label>
              <Select
                value={leaveData.allocate_on_day}
                onChange={(v) => setLeaveData({ ...leaveData, allocate_on_day: v })}
              >
                <option value="">Select day</option>
                <option value="1">1st</option>
                <option value="15">15th</option>
                <option value="last">Last day</option>
              </Select>
            </div>
            <div>
              <label className={LABEL}>Rounders</label>
              <input
                type="number"
                value={leaveData.rounders}
                onChange={(e) => setLeaveData({ ...leaveData, rounders: e.target.value })}
                className={cn(FIELD, 'tabular-nums')}
              />
            </div>
          </RuleSection>

          {/* Card 5 — Partially paid */}
          <RuleSection
            checked={leaveData.is_partially_paid}
            onToggle={(v) => setLeaveData({ ...leaveData, is_partially_paid: v })}
            title="Is partially paid?"
            hint="Pay a fraction of daily salary"
          >
            <div>
              <label className={LABEL}>Fraction of daily salary per leave</label>
              <input
                type="text"
                value={leaveData.fraction_salary_per_leave}
                onChange={(e) =>
                  setLeaveData({ ...leaveData, fraction_salary_per_leave: e.target.value })
                }
                className={cn(FIELD, 'tabular-nums')}
              />
            </div>
          </RuleSection>

          {/* Card 6 — Additional rules */}
          <div className={CARD}>
            <div className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.05em] text-v-ink400">
              Additional rules
            </div>
            <div className="grid grid-cols-1 gap-x-[22px] gap-y-3 sm:grid-cols-2">
              <FlagCard
                label="Is leave without pay"
                checked={leaveData.is_leave_without_pay}
                onChange={(v) => setLeaveData({ ...leaveData, is_leave_without_pay: v })}
              />
              <FlagCard
                label="Is optional leave"
                checked={leaveData.is_optional_leave}
                onChange={(v) => setLeaveData({ ...leaveData, is_optional_leave: v })}
              />
              <FlagCard
                label="Allow negative balance"
                checked={leaveData.allow_negative_balance}
                onChange={(v) => setLeaveData({ ...leaveData, allow_negative_balance: v })}
              />
              <FlagCard
                label="Allow over allocation"
                checked={leaveData.allow_over_allocation}
                onChange={(v) => setLeaveData({ ...leaveData, allow_over_allocation: v })}
              />
              <FlagCard
                label="Include holidays within leaves"
                checked={leaveData.include_holidays_within_leave}
                onChange={(v) => setLeaveData({ ...leaveData, include_holidays_within_leave: v })}
              />
              <FlagCard
                label="Is compensatory"
                checked={leaveData.is_compensatory}
                onChange={(v) => setLeaveData({ ...leaveData, is_compensatory: v })}
              />
            </div>
          </div>
        </form>
      )}
    </Drawer>
  );
};

export default Leave;
