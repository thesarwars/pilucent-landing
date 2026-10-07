"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Use dynamic import to avoid hydration issues with client components
const AiTutorChatPage = dynamic(() => import("./_components/ai-bot"), {
  ssr: false,
});

export default function Page() {
  const [isChatPage, setIsChatPage] = useState(false);

  if (isChatPage) {
    return <ChatPage />;
  }

  return (
    <>
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Balanzify AI
          </h1>
          <p className="mx-auto mb-8 max-w-md text-gray-600">
            Your personal AI for Accounting services. Get help with Accounting
            and more.
          </p>
          <button
            onClick={() => setIsChatPage(true)}
            className="to-accent_soft_teal transform rounded-lg bg-gradient-to-tr from-accent_soft_blue px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-teal-600"
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}

const ChatPage = () => {
  return <AiTutorChatPage />;
};
