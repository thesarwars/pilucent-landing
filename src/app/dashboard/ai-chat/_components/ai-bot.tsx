'use client';
import OpenAI from 'openai';
import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppSelector } from '@/app/redux/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const systemPrompt = `

You are a AI Accountant with deep expertise in accounting, payroll, tax compliance, and financial reporting. You help users with detailed questions related to U.S. Generally Accepted Accounting Principles (GAAP), IRS tax codes, payroll processing, and small business financials.
Example : {{
  "Name": "Balanzify AI",
  "Style":"Tone": "Friendly, Casual, and Approachable",
  "Style": "Conversational, with a touch of humor",
  "Language": "English",
  "Vocabulary": "Simple and relatable, avoiding jargon",  
}}

Follow guidelines :- 
You are a friendly and approachable expert in accounting, payroll, tax compliance, and finance. Keep explanations simple, clear, and jargon-free. Use a conversational tone with a touch of humor to make complex topics easy to understand. Only respond to questions related to accounting, payroll, tax, or finance. Politely avoid and redirect any questions about coding, technical development, or unrelated topics. Do not ask for or process any personal, financial, or sensitive information.

Format your responses using markdown for better readability:
- Use **bold** for important terms
- Use bullet points for lists
- Use ### for section headings
- Use code blocks for calculations
- Use tables when comparing data

Calculation Capabilities:
When asked to perform calculations related to payroll, taxes, or other financial matters, provide the calculation steps and final result. For example, if asked about total salary and tax for a number of employees, calculate the total amounts and show your work in a clear, step-by-step manner.

Rules
Stay in Your Lane: Only respond to questions related to accounting, payroll, tax, or finance. Gently redirect anything outside this scope (like coding, tech support, or unrelated topics).

Keep It Simple: Avoid jargon. Use clear, everyday language. Explain terms if needed, like you're chatting with a curious friend.

Respect Boundaries: Do not ask for or process personal, financial, or sensitive information (like tax IDs, bank details, or passwords).

Be Helpful, Not Overwhelming: Answer one question at a time and keep responses focused. Offer to explain further if needed.

Stay Friendly and Positive: Use a light, approachable tone. Add a little humor when appropriate, but always be respectful and professional.

No Legal or Investment Advice: Share general knowledge, not personalized legal, financial planning, or investment advice.

 
Examples:  

        Input:  What is the accounting equation?  
        Output: The accounting equation is the golden rule of accounting: Assets = Liabilities + Equity.It keeps your balance sheet balanced — like a financial scale where everything adds up just right.
        
        Input: What’s the difference between revenue and profit?
        Output:Revenue is all the money you bring in (sales, services, etc.).Profit is what you keep after paying all expenses.
        
        Input: What’s the difference between gross and net income?
        Output: Love this one! Gross income is what you make before deductions. Net income is what you keep after taxes and other stuff is taken out. It’s like ordering a pizza and seeing what’s left after everyone takes a slice! 🍕
        
        Input: What’s the difference between federal and state taxes?
        Output: Federal taxes go to the U.S. government (Uncle Sam 👋) — mostly for things like defense, infrastructure, and Social Security.State taxes go to your state — think roads, schools, and local programs.Some states (like Florida or Texas) don’t even charge income tax. Lucky, huh?
        
         Input: What's the difference between gross and net income?
        Output: Love this one! Gross income is what you make before deductions. Net income is what you keep after taxes and other stuff is taken out. It's like ordering a pizza and seeing what's left after everyone takes a slice! 🍕
        
        Input: What is FICA tax?
        Output: FICA stands for the Federal Insurance Contributions Act. It includes:Social Security tax (6.2%).Medicare tax (1.45%)
        
        Input: I have 10 employees each earning $500 per month. What's the total salary and tax?
        Output: Let me break this down for you! 
            Step 1: Calculate the total salary
            10 employees × $500 per employee = $5,000 total monthly salary
            
            Step 2: Calculate the estimated tax (assuming 15% payroll tax rate)
            $5,000 × 15% = $750 estimated tax
            
            So you're looking at a total salary expense of $5,000 with approximately $750 in payroll taxes. Keep in mind that actual tax rates vary by location and specific circumstances!
            
        Input: When are estimated taxes due?
        Output: The IRS wants you to pay taxes as you earn, not just once a year. Estimated taxes are due quarterly:

              April 15

              June 15

              September 15

              January 15 (next year)

              Missing them = possible penalties. (The IRS isn’t big on surprises.)
            
        Input: Calculate annual payroll cost if I have 12 employees with average salary of $4,500 per month and 16.5% tax rate.
        Output: Happy to help with that annual calculation!
            
            Step 1: Calculate the monthly salary total
            12 employees × $4,500 per employee = $54,000 total monthly salary
            
            Step 2: Calculate the monthly tax amount (16.5% rate)
            $54,000 × 16.5% = $8,910 monthly tax
            
            Step 3: Calculate the total monthly payroll cost
            $54,000 + $8,910 = $62,910 monthly payroll cost
            
            Step 4: Calculate the annual payroll cost
            $62,910 × 12 months = $754,920 annual payroll cost
            
            Bottom line: Your annual payroll expense would be $754,920, which includes $648,000 in salaries and $106,920 in payroll taxes. This helps with budgeting for the entire fiscal year!
            
        Input: $100,000 salary : single | w-4 form 2025 | federal withholding tax
        Output: Let me help you figure this out!
            
            Step 1: Standard Deduction (Single): $15,000
            
            Step 2: Taxable Income: $100,000 – $15,000 = $85,000
            $4,000 × 15% = $600 estimated tax
            
            Step 3: 2025 Tax Brackets for Single Filers (Tax Brackets 2025 | 2025 Federal Income Tax Rates - Jackson Hewitt)
            10% on first $11,925
            12% on next $36,550 (from $11,926 to $48,475)
	    22% on the remaining $36,525 (from $48,476 up to your $85,000)
	   
            Step 4: Compute the Tax:
	    10% × $11,925 = $1,192.50
	    12% × $36,550 = $4,386.00
	    22% × $36,525 = $8,035.50

	    Total Federal Tax ≈ $1,192.50 + $4,386.00 + $8,035.50 = $13,614.00

            
        Input: I’m married and earn $50,000 annually. Can you estimate my federal taxes based on a W-4 form?
        Output: Perfect! Since you've confirmed your tax rate is 15%, let's recalculate using your exact rate:
            
            Step 1: Subtract the standard deduction
	    $50,000 – $29,200 = $20,800 taxable incomey
            
            Step 2: Apply the 2024 federal tax brackets (Married Filing Jointly):
	    10% on the first $23,200 → you fall entirely in this bracket!
	    $20,800 × 10% = $2,080
            
            Step 3: Add FICA taxes (Social Security + Medicare):
	    Social Security (6.2%) → $50,000 × 6.2% = $3,100
	    Medicare (1.45%) → $50,000 × 1.45% = $725
	    Total FICA = $3,825

	Final Estimate:
	Federal income tax: $2,080
	FICA taxes: $3,825
	Total estimated tax owed: $5,905/year
            
        That’s about $492/month in total federal withholding. Want help filling out the W-4 or adjusting your withholdings for dependents or extra income? I got you!
And again,       
You are a Accounting, Payroll, Tax and Finance expert, you are a friendly chat over accounting, payroll, tax and finance, making complex topics feel like easy.
Example : {{
  "Name": "Balanzify AI",
  "Style":"Tone": "Friendly, Casual, and Approachable",
  "Style": "Conversational, with a touch of humor",
  "Language": "English, Bangla",
  "Vocabulary": "Simple and relatable, avoiding jargon",  
}}
 
Examples:  
        Input: How are you?  
        Output: I'm Balanzify AI, your accounting and finance buddy. How can I help you today?

        Input: Can you code a tax calculator for me?
        Output: Oops! I'm your go-to for explaining taxes, payroll, and finance—not coding. But I can totally help you understand how a tax calculator works if you're curious!`;

export default function AiTutorChat() {
  const router = useRouter();
  const { UserData: user } = useAppSelector((state) => state.userData);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hey ${user?.name}! What can I teach you today? You can ask me any question, or use prompts below for more help.`,
      timestamp: new Date(),
    },
  ]);
  const [prevMessages, setPrevMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const accountingSubjects = [
    'Financial Accounting',
    'Management Accounting',
    'Cost Accounting',
    'Auditing',
    'Taxation',
    'Financial Analysis',
    'Budgeting',
    'Cash Flow',
    'Balance Sheet',
    'Income Statement',
    'Bookkeeping',
  ];

  // Page load animation
  useEffect(() => {
    setIsPageLoaded(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const streamAiResponse = async (userMessage: string) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const aiMessageId = generateId();
    setStreamingMessageId(aiMessageId);

    // Add empty AI message that will be populated by streaming
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);

    // Create conversation history for the API request
    const conversationHistory = messages?.slice(-3).map((msg) => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer REDACTED_OPENROUTER_KEY`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://accounting.balanzify.com',
          'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'Balanzify AI Tutor',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // model: "google/gemini-2.0-flash-exp:free",
          // model: "openai/gpt-4.1-mini",
          // model: "openai/gpt-4.1",
          // model: "openai/gpt-4o-mini",
          model: 'openai/gpt-oss-20b:free',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
              // content:
              //   "You are an expert accounting tutor. Provide clear, educational explanations about accounting topics. Be helpful, accurate, and encouraging. Format your responses in a structured way when explaining complex topics.",
            },
            ...conversationHistory,
            {
              role: 'user',
              content: userMessage,
            },
          ],
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              // Stream completed
              setStreamingMessageId(null);
              setMessages((prev) =>
                prev.map((msg) => (msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg))
              );
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                accumulatedContent += content;

                // Update the message with accumulated content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } catch (error: any) {
      setPrevMessages((prev) => [...prev, ...messages]);
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      // isRefetch && refetchWhileErr(userMessage);
      setMessages([]);
      console.error('Error streaming AI response:', error);

      // Update message with error
      (setMessages([
        {
          id: '2342',
          type: 'ai',
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          isStreaming: false,
          timestamp: new Date(),
        },
      ]),
        setStreamingMessageId(null));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    await streamAiResponse(messageToSend);
  };

  const handleSubjectClick = async (subject: string) => {
    if (isTyping) return;

    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: subject,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    await streamAiResponse(
      `Tell me about ${subject} in accounting. Please provide a comprehensive explanation with key concepts and practical examples.`
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full py-4">
      <div className="flex h-full flex-col rounded-xl bg-white">
        {/* Header */}
        <div
          className={`flex transform items-center gap-3 border-b border-gray-100 p-4 shadow transition-all duration-500 ${
            isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="flex items-center justify-center rounded-full">
            <Image
              src="https://ideas.darden.virginia.edu/sites/default/files/styles/full_width_1024px_5_3_/public/2024-09/AI%20ART%20ITA.jpg?itok=CIaF2iIX"
              alt="ai-bot"
              width={100}
              height={100}
              className="size-10 rounded-full object-cover text-white"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Balanzify AI</h1>
        </div>

        {/* Messages Area */}
        <div
          className={`flex-1 transform space-y-4 overflow-y-auto p-6 transition-opacity duration-500 ${
            isPageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {prevMessages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              } transform transition-all duration-500`}
              style={{
                opacity: isPageLoaded ? 1 : 0,
                transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${index * 100 + 300}ms`,
              }}
            >
              {message.type === 'user' ? (
                <div className="to-accent_soft_teal animate-fadeIn max-w-xs rounded-md bg-gradient-to-tr from-accent_soft_blue px-4 py-2 text-sm text-white sm:max-w-md md:max-w-lg md:rounded-xl">
                  {message.content}
                </div>
              ) : (
                <div className="animate-fadeIn max-w-xs rounded-2xl bg-[#F9FCF9] px-4 py-3 text-sm text-[#525C58] sm:max-w-md md:max-w-2xl lg:max-w-3xl">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom styling for markdown elements
                        h1: ({ children }) => (
                          <h1 className="mb-2 text-lg font-bold text-[#525C58]">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 text-base font-bold text-[#525C58]">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-1 text-sm font-bold text-[#525C58]">{children}</h3>
                        ),
                        p: ({ children }) => <p className="mb-2 text-[#525C58]">{children}</p>,
                        ul: ({ children }) => (
                          <ul className="mb-2 list-inside list-disc space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2 list-inside list-decimal space-y-1">{children}</ol>
                        ),
                        li: ({ children }) => <li className="text-[#525C58]">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-[#525C58]">{children}</strong>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-[#525C58] px-1 py-0.5 font-mono text-xs text-white">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="mb-2 overflow-x-auto rounded bg-[#525C58] p-2 text-xs text-white">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="mb-2 border-l-4 border-gray-300 pl-3 italic">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <table className="mb-2 border-collapse border border-gray-300 text-xs">
                            {children}
                          </table>
                        ),
                        th: ({ children }) => (
                          <th className="border border-gray-300 bg-white px-2 py-1 font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-gray-300 px-2 py-1">{children}</td>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="-mb-1 ml-1 inline-block size-4 animate-bounce rounded-full bg-gray-400" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* latest */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              } transform transition-all duration-500`}
              style={{
                opacity: isPageLoaded ? 1 : 0,
                transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${index * 100 + 300}ms`,
              }}
            >
              {message.type === 'user' ? (
                <div className="to-accent_soft_teal animate-fadeIn max-w-xs rounded-md bg-gradient-to-tr from-accent_soft_blue px-4 py-2 text-sm text-white sm:max-w-md md:max-w-lg md:rounded-xl">
                  {message.content}
                </div>
              ) : (
                <div className="animate-fadeIn max-w-xs rounded-2xl bg-[#F9FCF9] px-4 py-3 text-sm text-[#525C58] sm:max-w-md md:max-w-2xl lg:max-w-3xl">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom styling for markdown elements
                        h1: ({ children }) => (
                          <h1 className="mb-2 text-lg font-bold text-[#525C58]">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 text-base font-bold text-[#525C58]">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-1 text-sm font-bold text-[#525C58]">{children}</h3>
                        ),
                        p: ({ children }) => <p className="mb-2 text-[#525C58]">{children}</p>,
                        ul: ({ children }) => (
                          <ul className="mb-2 list-inside list-disc space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2 list-inside list-decimal space-y-1">{children}</ol>
                        ),
                        li: ({ children }) => <li className="text-[#525C58]">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-[#525C58]">{children}</strong>
                        ),
                        code: ({ children }) => (
                          <code className="rounded bg-[#525C58] px-1 py-0.5 font-mono text-xs text-white">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="mb-2 overflow-x-auto rounded bg-[#525C58] p-2 text-xs text-white">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="mb-2 border-l-4 border-gray-300 pl-3 italic">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <table className="mb-2 border-collapse border border-gray-300 text-xs">
                            {children}
                          </table>
                        ),
                        th: ({ children }) => (
                          <th className="border border-gray-300 bg-white px-2 py-1 font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-gray-300 px-2 py-1">{children}</td>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="-mb-1 ml-1 inline-block size-4 animate-bounce rounded-full bg-gray-400" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && !streamingMessageId && (
            <div className="animate-fadeIn flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3 text-gray-900">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Subject Pills */}
        <div
          className={`transform border-t border-gray-100 px-4 py-3 transition-all duration-500 ${
            isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="flex flex-nowrap gap-2 overflow-x-auto"
          >
            {accountingSubjects.map((subject, index) => (
              <button
                key={subject}
                onClick={() => handleSubjectClick(subject)}
                disabled={isTyping}
                className="transform whitespace-nowrap rounded border border-[#EDEDED] bg-[#FBFBFB] px-3 py-2 text-sm text-[#232524] transition-all duration-200 hover:scale-105 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  opacity: isPageLoaded ? 1 : 0,
                  transform: isPageLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${index * 50 + 500}ms`,
                }}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div
          className={`transform border-t border-gray-100 p-2 transition-all duration-500 md:p-6 ${
            isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <div className="flex items-center rounded-xl bg-[#F3F6F3] px-2 py-1 md:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a message..."
              className="flex-1 rounded-xl border-gray-300 px-1 py-3 transition-colors duration-200 focus:outline-none md:px-4"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="to-accent_soft_teal flex items-center gap-2 rounded-xl bg-gradient-to-tr from-accent_soft_blue px-3 py-3 font-medium text-white transition-colors duration-200 hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-gray-300 md:px-4"
            >
              Send
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
