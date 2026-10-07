import { cn } from '@/lib/utils';
import Image from 'next/image';

type AvatarProps = React.ComponentProps<'div'> & {
  image?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circle' | 'square';
};
function Avatar({
  image,
  alt = 'Avatar',
  size = 'large',
  variant = 'circle',
  className,
  ...props
}: AvatarProps) {
  const url = image
    ? image.startsWith('http')
      ? image
      : `https://balanzifyapi.jumatechs.xyz/${image}`
    : '/snap-expense/avatar-placeholder.svg';
  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        variant === 'circle' ? 'rounded-full' : 'rounded-lg',
        size === 'small' ? 'h-8 w-8' : size === 'medium' ? 'h-10 w-10' : 'h-12 w-12',
        className
      )}
      {...props}
    >
      <Image
        src={url}
        alt={alt || 'Avatar'}
        width={200}
        height={200}
        className="h-full w-full object-top object-cover"
      />
    </div>
  );
}

export default Avatar;
