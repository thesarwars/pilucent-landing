'use client'
import React, { useState } from 'react';

const Faq = () => {
    const [expanded, setExpanded] = useState(null);

    const handleToggle = (index) => {
        setExpanded(expanded === index ? null : index);
    };

    const faqItems = [
        {
            question: "What do I get in my 30-day free trial of Balanzify?",
            answer: "During your free trial, you gain full access to all Balanzify features, including AI-driven invoicing, automated bookkeeping, and real-time financial insights. Experience how Balanzify can transform your accounting processes before committing."
        },
        {
            question: "Which Balanzify plan is right for me?",
            answer: "Balanzify offers different plans tailored to freelancers, small businesses, and enterprises. Our AI-powered recommendations help you select the best plan based on your accounting needs and business size."
        },
        {
            question: "What is AI-driven accounting software?",
            answer: "AI-driven accounting software leverages artificial intelligence to automate tasks such as expense tracking, invoice generation, and tax calculations, improving efficiency and accuracy while reducing manual work."
        },
        {
            question: "How does Balanzify automate financial management?",
            answer: "Balanzify uses AI to categorize expenses, auto-generate reports, and detect financial trends, saving you time and effort. With intelligent automation, you can focus on growing your business while Balanzify handles the numbers."
        },
        {
            question: "Can I use Balanzify across multiple devices?",
            answer: "Yes! Balanzify is a cloud-based platform accessible on desktops, tablets, and mobile devices. Your financial data syncs in real time, ensuring you can manage your business finances anytime, anywhere."
        },
    ];

    return (
        <div className="container py-8">
            <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

            <div className="space-y-4">
                {faqItems.map((item, index) => (
                    <div key={index} className="border-b rounded-lg">
                        <button
                            className="w-full px-4 py-4 text-left flex justify-between items-center"
                            onClick={() => handleToggle(index)}
                        >
                            <span className="text-[#5A607F] font-semibold text-xl">{item.question}</span>
                            <svg
                                className={`w-5 h-5 text-gray-400 transform transition-transform ${expanded === index ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {expanded === index && (
                            <div className="px-6 py-4 text-gray-400">
                                {item.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faq;