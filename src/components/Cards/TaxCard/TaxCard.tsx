import { Card } from '@/components/ui/card';
import Image from 'next/image';

const TaxCard = ({
  imageURL,
  HText,
  PText,
}: {
  imageURL: string;
  HText: string;
  PText: string;
}) => {
  return (
    <Card className="rounded-xl px-6 py-4">
      <Image src={`/images/icons/${imageURL}.png`} width={40} height={40} alt="frame" />
      <h1 className="mb-1 mt-2 text-xl font-semibold text-[#6A6EF6] md:text-2xl">${HText}</h1>
      <p className="text-accent_soft_black max-md:text-sm">{PText}</p>
    </Card>
  );
};

export default TaxCard;
