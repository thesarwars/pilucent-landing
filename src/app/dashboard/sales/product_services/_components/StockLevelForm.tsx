import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Boxes, Check, Loader2 } from "lucide-react";
import {
  fetchStockLevel,
  patchStockLevel,
  postStockLevel,
} from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import { cn } from "@/lib/utils";
import { VioletButton } from "@/components/violet";

interface StockLevelFormProps {
  onClose: () => void;
}

const FIELD =
  "w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13px] font-medium text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]";
const LABEL = "mb-1.5 block text-[12px] font-semibold text-v-ink700";

const StockLevelForm = ({ onClose }: StockLevelFormProps) => {
  const [data, setData] = useState<any>({
    status: "ACTIVE",
    quantity: "",
    description: "",
    is_expired_date: false,
    before_expired_day: "",
  });
  const [uid, setUID] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { Permissions } = useAppSelector((state) => state.Permissions);

  // Load existing data when available
  useEffect(() => {
    const fn = async () => {
      try {
        const res = await fetchStockLevel();
        setData(res?.results?.[0]);
        setUID(res?.results?.[0]?.uid || "");
      } catch (error) {
        toast.error("Failed to fetch stock data");
      }
    };
    fn();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !Permissions?.includes("change_stockalert") &&
      !Permissions?.includes("add_stockalert")
    ) {
      return toast.info("You don't have permission to perform this action");
    }

    try {
      setIsLoading(true);
      if (uid) {
        const res = await patchStockLevel(uid, data);
        if (res?.success) {
          toast.success("Stock Level Adjusted");
          onClose && onClose();
        }
      } else {
        const res = await postStockLevel(data);
        if (res?.success) {
          toast.success("Stock Level Adjusted");
          onClose && onClose();
        }
      }
    } catch (error) {
      //error here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 font-jakarta text-v-ink900" onSubmit={handleSubmit}>
      <div className="rounded-v-card border border-v-border bg-white p-5">
        <div className="flex flex-col gap-4">
          <div>
            <label className={LABEL}>Stock level alert at</label>
            <input
              name="quantity"
              className={cn(FIELD, "tabular-nums")}
              type="number"
              value={data?.quantity}
              onChange={(e) =>
                setData({
                  ...data,
                  quantity: Math.floor(Number(e.target.value) || 0),
                })
              }
              required
            />
          </div>

          <div>
            <label className={LABEL}>Message</label>
            <textarea
              name="description"
              placeholder="Add a description here"
              className={cn(FIELD, "h-24 resize-none")}
              value={data?.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              disabled={isLoading}
            />
          </div>

          {/* expired-date toggle card */}
          <button
            type="button"
            onClick={() => setData({ ...data, is_expired_date: !data?.is_expired_date })}
            className={cn(
              "flex items-center gap-2.5 rounded-[12px] border-[1.5px] px-3.5 py-3 text-left transition-colors",
              data?.is_expired_date
                ? "border-v-primary bg-[#F8F5FF]"
                : "border-v-border bg-white hover:border-[#B49AFF]",
            )}
          >
            <span
              className={cn(
                "flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors",
                data?.is_expired_date ? "border-v-primary bg-v-primary text-white" : "border-v-border bg-white",
              )}
            >
              {data?.is_expired_date && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </span>
            <span className="text-[12.5px] font-semibold text-v-ink800">Alert before expiry date</span>
          </button>

          {data?.is_expired_date && (
            <div className="animate-v-pop">
              <label className={LABEL}>Days before expiry</label>
              <input
                name="before_expired_day"
                placeholder="30"
                className={cn(FIELD, "tabular-nums")}
                type="number"
                min="0"
                value={data?.before_expired_day}
                onChange={(e) =>
                  setData({
                    ...data,
                    before_expired_day: Math.floor(Number(e.target.value)),
                  })
                }
                required={data?.is_expired_date}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5">
        <VioletButton type="button" variant="outline" onClick={() => onClose && onClose()} disabled={isLoading}>
          Cancel
        </VioletButton>
        <VioletButton
          type="submit"
          variant="primary"
          disabled={isLoading}
          leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        >
          {isLoading ? "Saving…" : "Save & close"}
        </VioletButton>
      </div>
    </form>
  );
};

export default StockLevelForm;
