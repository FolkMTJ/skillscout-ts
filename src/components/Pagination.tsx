interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Don't show pagination if only 1 page or less
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-12 select-none">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`group flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ease-in-out
          ${
            currentPage === 1
              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
              : 'border-gray-200 bg-white text-gray-600 hover:border-[#F2B33D] hover:text-[#F2B33D] hover:shadow-md active:scale-95'
          }`}
      >
        {/* Left Arrow Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex gap-2 p-1 bg-gray-50 rounded-full">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-full font-medium text-sm transition-all duration-300 transform
              ${
                currentPage === page
                  ? 'bg-[#F2B33D] text-white shadow-lg shadow-orange-200 scale-105'
                  : 'text-gray-500 hover:bg-white hover:text-[#F2B33D] hover:shadow-sm'
              }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`group flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ease-in-out
          ${
            currentPage === totalPages
              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
              : 'border-gray-200 bg-white text-gray-600 hover:border-[#F2B33D] hover:text-[#F2B33D] hover:shadow-md active:scale-95'
          }`}
      >
        {/* Right Arrow Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
