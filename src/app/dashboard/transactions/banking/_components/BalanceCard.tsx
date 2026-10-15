  import Modal from "@/app/(admin)/_components/Modal";
  import Button from "@/components/ui/RawButton";
  import moment from "moment";
  import { BiSolidEdit } from "react-icons/bi";
  import { FaCheckCircle, FaRegCreditCard } from "react-icons/fa";
  import { RiBankFill } from "react-icons/ri";
  import UpdateAccount from "../../coa_tree/_components/UpdateAccount";
  import { useState } from "react";
  import { IoCheckmarkCircleSharp } from "react-icons/io5";
  import { toast } from "@/lib/ToastService";
  import TopModal from "@/components/ui/ScrollSelectDropDowns/TopModal";

  const BalanceCard = ({
    setSelectedCard,
    selectedCard,
    AccountData,
    kind,
    edit = true,
    refetch,
  }: {
    refetch: any;
    setSelectedCard: any;
    selectedCard: any;
    AccountData: any;
    kind: string;
    edit?: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [updateUID, setUpdateUID] = useState("");

    const handleEdit = (uid: string) => {
      setUpdateUID(uid);
      setIsOpen(true);
    };

    if (!AccountData?.chart_of_account?.uid) {
      return;
    }

    return (
      <>
        <div
          onClick={(e) => {
            setSelectedCard(AccountData?.chart_of_account);
          }}
          className={`${selectedCard?.uid == AccountData?.chart_of_account?.uid ? "border border-accent_soft_blue" : "border"} w-full md:w-[350px] cursor-pointer rounded-xl bg-[#e0eefc]`}
        >
          <div
            className={`${selectedCard?.uid == AccountData?.chart_of_account?.uid ? "bg-accent_soft_blue text-white" : "bg-white text-accent_soft_black"}  z-[10] flex flex-col justify-between rounded-xl p-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 ">
                {kind == "card" ? (
                  <div className="rounded-full bg-blue-700 text-white p-2">
                    <FaRegCreditCard className="text-2xl" />
                  </div>
                ) : (
                  <div className="rounded-full bg-accent_granite p-2">
                    <RiBankFill className="text-2xl" />
                  </div>
                )}{" "}
                <span className="text-lg ">
                  {AccountData?.chart_of_account?.title}
                </span>
              </div>{" "}
              {edit && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(AccountData?.chart_of_account?.is_fixed){
                      return toast.info("You can't edit fixed accounts")
                    }
                    handleEdit(AccountData?.chart_of_account?.uid);
                  }}
                  className="p-1 hover:bg-gray-200 "
                >
                  <BiSolidEdit className="text-2xl" />
                </Button>
              )}
            </div>
            <div className="flex items-end justify-between">
              <p className="mt-4 flex flex-col">
                <span className="text-xl font-medium ">
                  {AccountData?.bank_balance || "0.00"}
                </span>
                <span className="text-sm uppercase ">
                  Bank Balance
                </span>
              </p>
              <p className="text-sm font-light ">
                Updated On:{" "}
                {moment(AccountData?.chart_of_account?.updated_at).format(
                  "DD/MM/YYYY",
                )}
              </p>
            </div>
          </div>
          <div className="flex items-end bg-blue justify-between p-4">
            <p className="flex flex-col">
              <span className="text-xl font-medium text-[#131523]">
                ${AccountData?.chart_of_account?.opening_balance}
              </span>
              <span className="text-sm font-light">IN PILUCENT</span>
            </p>
            <p
              className={`${kind == "card" ? "text-accent_soft_blue" : "text-[#131523]"} text-lg font-medium`}
            >
              {AccountData?.status_for_review ? AccountData?.status_for_review : <IoCheckmarkCircleSharp className="text-accent_soft_blue text-3xl"/>}
            </p>
          </div>
        </div>
        <TopModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Edit Account"
          widthClass="w-full md:w-[550px]"
        >
          <UpdateAccount
            setIsOpen={setIsOpen}
            refetch={refetch}
            uid={updateUID}
          />
        </TopModal>
      </>
    );
  };

  export default BalanceCard;
