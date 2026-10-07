// app/error.tsx
'use client';

import { lexend } from '@/lib/font';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Caught by global error boundary:', error);
  }, [error]);

  console.log(error);

  const size = 100;
  const color = '#00035F';
  const backgroundColor = 'transparent';

  return (
    <html>
      <body
        className={`${lexend.variable} flex h-screen flex-col items-center justify-center gap-8 font-lexend`}
      >
        <>
          <style jsx global>{`
            @keyframes fillPath {
              0% {
                clip-path: inset(0 100% 0 0);
              }
              40%,
              60% {
                clip-path: inset(0 0 0 0);
              }
              100% {
                clip-path: inset(0 0 0 100%);
              }
            }

            @keyframes tracePath {
              0% {
                stroke-dashoffset: 1000;
                opacity: 1;
              }
              40% {
                stroke-dashoffset: 0;
                opacity: 1;
              }
              60% {
                stroke-dashoffset: 0;
                opacity: 1;
              }
              100% {
                stroke-dashoffset: -1000;
                opacity: 1;
              }
            }

            .logo-path-fill {
              clip-path: inset(0 100% 0 0);
            }

            .logo-path-trace {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
            }

            .logo-path-fill-1 {
              animation: fillPath 3s ease-in-out infinite;
            }

            .logo-path-fill-2 {
              animation: fillPath 3s ease-in-out 0.5s infinite;
            }

            .logo-path-trace-1 {
              animation: tracePath 3s ease-in-out infinite;
            }

            .logo-path-trace-2 {
              animation: tracePath 3s ease-in-out 0.5s infinite;
            }
          `}</style>

          <div>
            <svg
              width={size}
              height={size}
              viewBox="0 0 215 215"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                {/* Filled paths with clip-path animation */}
                <path
                  d="M34.7851 76.0188V59.4569C34.7851 26.6219 61.6847 0 94.8624 0H126.452C159.63 0 186.53 26.6219 186.53 59.4569V84.3992C186.53 115.843 160.78 141.327 129.007 141.327H9.98384C4.67323 141.327 0.0926536 137.21 0.00140606 131.954C-0.0898415 126.59 4.27186 122.219 9.65547 122.219H129.007C150.104 122.219 167.203 105.296 167.203 84.4172V59.4749C167.203 37.2057 148.954 19.1447 126.452 19.1447H94.8624C72.3607 19.1447 54.1113 37.2057 54.1113 59.4749V73.8334"
                  fill={color}
                  className="logo-path-fill logo-path-fill-1"
                />
                <path
                  d="M54.7511 141.344V195.798H142.093C171.603 195.798 195.619 172.03 195.619 142.825C195.619 113.621 171.603 89.8524 142.093 89.8524H9.65657C4.32771 89.8524 0.00250244 85.572 0.00250244 80.2981C0.00250244 75.0243 4.32771 70.7439 9.65657 70.7439H142.093C182.26 70.7439 214.945 103.091 214.945 142.843C214.945 182.596 182.26 214.943 142.093 214.943H35.4249V141.362"
                  fill={color}
                  className="logo-path-fill logo-path-fill-2"
                />

                {/* Stroke overlay for tracing effect */}
                <path
                  d="M34.7851 76.0188V59.4569C34.7851 26.6219 61.6847 0 94.8624 0H126.452C159.63 0 186.53 26.6219 186.53 59.4569V84.3992C186.53 115.843 160.78 141.327 129.007 141.327H9.98384C4.67323 141.327 0.0926536 137.21 0.00140606 131.954C-0.0898415 126.59 4.27186 122.219 9.65547 122.219H129.007C150.104 122.219 167.203 105.296 167.203 84.4172V59.4749C167.203 37.2057 148.954 19.1447 126.452 19.1447H94.8624C72.3607 19.1447 54.1113 37.2057 54.1113 59.4749V73.8334"
                  stroke={color}
                  strokeWidth="2"
                  fill="transparent"
                  className="logo-path-trace logo-path-trace-1"
                />
                <path
                  d="M54.7511 141.344V195.798H142.093C171.603 195.798 195.619 172.03 195.619 142.825C195.619 113.621 171.603 89.8524 142.093 89.8524H9.65657C4.32771 89.8524 0.00250244 85.572 0.00250244 80.2981C0.00250244 75.0243 4.32771 70.7439 9.65657 70.7439H142.093C182.26 70.7439 214.945 103.091 214.945 142.843C214.945 182.596 182.26 214.943 142.093 214.943H35.4249V141.362"
                  stroke={color}
                  strokeWidth="2"
                  fill="transparent"
                  className="logo-path-trace logo-path-trace-2"
                />
              </g>
            </svg>
          </div>
        </>
        <div className="text-center">
          <h1 className="mb-8 text-center text-2xl">Something went wrong.</h1>
          <p>Please try refreshing the page or come back later.</p>
          <button
            className="rounded-md bg-accent_soft_black px-4 py-2 text-white hover:underline"
            onClick={reset}
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
