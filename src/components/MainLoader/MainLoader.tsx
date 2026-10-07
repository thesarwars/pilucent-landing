import LogoLoader from "./logo-loader";

const MainLoader = ({
  className,
  color,
  size=120,
}: {
  size?: number;
  className?: string;
  color?: string;
}) => {
  return (
    <div
      className={`flex h-[100vh] w-[100wh] flex-col items-center justify-center ${className}`}
    >
      <LogoLoader size={size} color={color} />
      {/* <div className="animate-spin rounded-full h-24 w-24 border-t-[7px] border-b-[7px] border-t-primary border-b-accent_soft_blue"></div> */}
    </div>
  );
};

export default MainLoader;
