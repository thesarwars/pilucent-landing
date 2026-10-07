import { useRouter } from 'next/navigation';
import React from 'react';

const SuccessScreen: React.FC = () => {
  const router = useRouter();
  // In a real app, replace this with navigation logic (e.g. useNavigate or router.push)
  const handleGoToDashboard = () => {
    router.push(process.env.NEXT_PUBLIC_REDIRECT_URL + '/auth?action=sign-in');
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center rounded-xl bg-blue-50 p-8 text-center">
        {/* Check‐Circle Avatar (inline SVG) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="100"
          height="100"
          viewBox="0,0,256,256"
        >
          <defs>
            <linearGradient
              x1="8.069"
              y1="12.21"
              x2="37.634"
              y2="41.775"
              gradientUnits="userSpaceOnUse"
              id="color-1_mVX4VZPnIMkd_gr1"
            >
              <stop offset="0" stop-color="#0f35c6"></stop>
              <stop offset="1" stop-color="#6a6ef6"></stop>
            </linearGradient>
            <linearGradient
              x1="27.581"
              y1="8.877"
              x2="27.581"
              y2="45.822"
              gradientUnits="userSpaceOnUse"
              id="color-2_mVX4VZPnIMkd_gr2"
            >
              <stop offset="0" stop-color="#6a6ef6"></stop>
              <stop offset="1" stop-color="#6a6ef6"></stop>
            </linearGradient>
          </defs>
          <g
            fill="none"
            fill-rule="nonzero"
            stroke="none"
            stroke-width="1"
            stroke-linecap="butt"
            stroke-linejoin="miter"
            stroke-miterlimit="10"
            stroke-dasharray=""
            stroke-dashoffset="0"
            font-family="none"
            font-weight="none"
            font-size="none"
            text-anchor="none"
            style={{ mixBlendMode: 'normal' }}
          >
            <g transform="scale(5.33333,5.33333)">
              <path
                d="M3.991,23.999c0,-11.044 8.964,-20.009 20.009,-20.009v5c-8.284,0 -15.009,6.727 -15.009,15.009c0,8.284 6.725,15.009 15.009,15.009c8.283,0 15.009,-6.725 15.009,-15.009h5c0,11.045 -8.965,20.009 -20.009,20.009c-11.045,0.001 -20.009,-8.963 -20.009,-20.009z"
                fill="url(#color-1_mVX4VZPnIMkd_gr1)"
              ></path>
              <path
                d="M22.662,29.425l-7.796,-6.381l3.167,-3.868l5.848,4.787l12.522,-15.524l3.892,3.14l-14.104,17.482c-0.87,1.078 -2.456,1.242 -3.529,0.364z"
                fill="url(#color-2_mVX4VZPnIMkd_gr2)"
              ></path>
            </g>
          </g>
        </svg>

        {/* Heading */}
        <h1 className="mb-2 text-3xl font-semibold text-indigo-600">Congratulations!</h1>

        {/* Subtitle */}
        <p className="mb-6 text-gray-600">
          Your company profile is ready, let’s check your dashboard!
        </p>

        {/* Button */}
        <button
          onClick={handleGoToDashboard}
          className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
