import Image from "next/image";

const InventoryCard = ({
  imageURL,
  stock,
  stockName,
}: {
  imageURL: string;
  stock: number;
  stockName: string;
}) => {
  return (
    <div style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }} className="flex items-center gap-8 p-8 bg-[#f8fbff] rounded-xl">
      <Image
        src={`/images/${imageURL}.png`}
        width={97}
        height={90}
        alt="Stock"
      />
      <div>
        <h1 className="text-3xl font-semibold text-accent_soft_black ">{stock}</h1>
        <p className="text-accent_soft_black ">{stockName}</p>
      </div>
    </div>
  );
};

export default InventoryCard;
