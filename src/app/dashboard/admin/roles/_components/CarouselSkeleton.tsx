const CarouselSkeleton = () => (
  <div className="flex h-[167px] w-full animate-pulse flex-col justify-between rounded-[12px] bg-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="h-6 w-6 rounded-full bg-gray-300"></div>
      <div className="h-4 w-4 bg-gray-300"></div>
    </div>
    <div className="mt-5 h-5 w-1/2 bg-gray-300"></div>
    <div className="mt-3 flex items-center justify-between">
      <div className="h-3 w-1/3 bg-gray-300"></div>
      <div className="flex space-x-2">
        <div className="h-7 w-7 rounded-full bg-gray-300"></div>
        <div className="h-7 w-7 rounded-full bg-gray-300"></div>
        <div className="h-7 w-7 rounded-full bg-gray-300"></div>
      </div>
    </div>
  </div>
);

export default CarouselSkeleton;
