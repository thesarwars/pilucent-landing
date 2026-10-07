
const LoadingSpinner = () => {
    return (
        <div className="h-[80vh] flex items-center justify-center">
          <p className="mr-1 inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />
        </div>
    );
};

export default LoadingSpinner;