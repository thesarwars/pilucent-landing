const InDev = ({ title = "this page" }: { title?: any }) => {
  return (
    <div className="texts-sm my-4 flex items-center justify-center rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-red-500">
      <p className="text-center">
        Info: can't do any action here cause{" "}
        <span className="font-semibold capitalize">{title || ""}</span> is in
        development!
      </p>
    </div>
  );
};

export default InDev;
