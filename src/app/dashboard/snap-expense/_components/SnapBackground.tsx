import Image from "next/image"

function SnapBackground() {
  return (
    <Image src="/snap-expense/snap_bg.webp" alt="Snap Expense Background" width={3840} height={3218} className="object-contain -z-10 w-full h-auto absolute top-0 left-0" />
    // <div aria-hidden="true" className="absolute top-0 left-0 w-full h-full">
    //   <div className="absolute top-0 left-0 w-full h-full snap_bg_container" />
    //   <Image 
    //   src="/snap-expense/snapBg.webp"
    //   alt="Snap Expense Background"
    //   fill
    //   priority
    //   className="object-center  -z-10"
    //   />
    //   <Image 
    //   src="/snap-expense/circleA.webp"
    //   alt="Circle A"
    //   width={280}
    //   height={280}
    //   className="object-contain aspect-square absolute left-0 top-0  -z-10"
    //   />
    //   <Image 
    //   src="/snap-expense/circleB.webp"
    //   alt="Circle B"
    //   width={400}
    //   height={400}
    //   className="object-contain aspect-square absolute right-0 bottom-0 -z-10 "
    //   />
    
    // </div>
  )
}

export default SnapBackground