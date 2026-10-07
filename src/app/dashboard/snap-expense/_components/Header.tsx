import Image from 'next/image';
// import { SearchInput } from './ui/Input';
// import Avatar from './ui/Avatar';
// import { useSnapExpense } from './context/SnapExpense.Context';

function SnapExpenseHeader() {
  // const { user } = useSnapExpense();
  return (
    <header className="flex w-full items-center justify-between gap-8 bg-transparent px-6 py-6 font-inter">
      <div className="flex shrink-0 items-center gap-5">
        <Image src="/snap-expense/balanzify.svg" alt="Snap Expense Logo" width={113} height={26} />
        {/* <h4 className="justify-start text-base font-semibold leading-6 text-white">
          Snap Expense
        </h4> */}
      </div>
      {/* <div className="flex shrink-0 items-center gap-5">
        <SearchInput color="grey" containerClassName="w-fit" />
        <button type="button">
          <Image
            src="/snap-expense/notification-grey.svg"
            alt="Notification"
            width={24}
            height={24}
          />
        </button>

        <Avatar />
      </div> */}
    </header>
  );
}

export default SnapExpenseHeader;
