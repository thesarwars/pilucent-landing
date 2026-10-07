import { cn } from "@/lib/utils"
import Image from "next/image"

type InputProps = React.ComponentProps<"input"> & {

}
function Input({  className,...props}: InputProps) {
  return (
    <input
          className={cn("w-full rounded-full outline outline-1 outline-offset-[-1px] outline-white py-[0.9rem] px-6 text-[#FFFF] placeholder:text-[#EAEAEA] focus:outline-[#C4B8E0] bg-transparent", className)}
          type={'search'}
          {...props}
        />
  )
}

export default Input


type SearchInputProps = InputProps & {
variant?: 'default' | 'icon'
color?: 'white' | 'grey' |'dark'
containerClassName?: string
}

export const SearchInput = ({ className, variant = 'default', color = 'dark', containerClassName, ...props }: SearchInputProps) => {
  return (
    <div className={cn("relative", containerClassName)}>
        <Input
          placeholder="Search conversations"
          type="text"
          className={className}
          {...props}
        />
        <Image src={`/snap-expense/search-${color}.svg`} alt="Search" width={20} height={20} className="absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2" />
    </div>
  )
}