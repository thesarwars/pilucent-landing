import Image from "next/image";

const ServiceCard = ({
  title,
  description,
  image,
  onClick,
}: {
  title: string;
  description: string;
  image: string;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="flex font-lexend cursor-pointer bg-[#D7DBEC] rounded-2xl px-3 py-8 justify-center flex-col items-center "
    >
      <Image
        src={`/images/${image}.png`}
        width={50}
        height={50}
        alt="inventory"
      />
      <h1 className="text-lg mt-3 font-semibold text-[#6A6EF6] text-center ">
        {title}
      </h1>
      <p className="text-center text-xs">{description}</p>
    </div>
  );
};

export default ServiceCard;
