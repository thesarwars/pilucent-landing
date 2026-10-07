"use client";
import React, { useEffect, useRef, useState, use } from "react";
import Image from "next/image";
import ChatInput from "@/components/ui/ChatInput";
import {
  fetchSupportInbox,
  fetchSupportTicketSA,
  postSupportInbox,
} from "@/app/helpers/backend";
import { useQuery } from "@tanstack/react-query";
import FileView from "@/app/(admin)/admin/support/_components/FileView";
import SupportSidebar from "@/app/(admin)/admin/support/_components/SupportSidebar";
import PreviousMessages from "../_components/PreviousMessages";
import { formatChatTime } from "@/utils/ChatTime";
import { useFetch } from "@/app/helpers/hooks";
import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";

// Query configuration
const QUERY_CONFIG = {
  staleTime: 0,
  cacheTime: 0,
  refetchInterval: 7000,
  refetchOnWindowFocus: false,
  retry: 5,
};

const imageBaseURL = "https://balanzifyapi.jumatechs.xyz";

const Page = (props: { params: Promise<any> }) => {
  const params = use(props.params);
  const [message, setMessage] = useState("");
  const [ticketData, setTicketData] = useState<any>({});
  const [messages, setMessages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uniqueMessages, setUniqueMessages] = useState<any>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [refetchAgain, setRefetchAgain] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["/support/tickets/", params?.uid],
    queryFn: async () => {
      const data = await fetchSupportInbox(params?.uid);
      if (JSON.stringify(data?.results) === JSON.stringify(messages)) return;
      setMessages([...data?.results, ...messages]);
      return messages;
    },
    ...QUERY_CONFIG,
  });

  useEffect(() => {
    const uniques = removeDuplicatesAndSort(messages);
    if (JSON.stringify(uniques) == JSON.stringify(uniqueMessages)) return;
    setUniqueMessages(uniques);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const removeDuplicatesAndSort = (items: any) => {
    const uniqueItemsMap: any = {};

    items.forEach((item: any) => {
      uniqueItemsMap[item.uid] = item;
    });

    const uniqueItems = Object.values(uniqueItemsMap);
    uniqueItems.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
    });

    return uniqueItems;
  };

  // Create a reference to the messages container
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [uniqueMessages]);

  const {
    data: supportData,
    isPending: isDataPending,
    refetch: refetchTicket,
  } = useQuery({
    queryKey: ["supportDetails"],
    queryFn: () => fetchSupportTicketSA(params?.uid),
    enabled: Boolean(params?.uid),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 3,
  });

  useEffect(() => {
    if (supportData) setTicketData(supportData);
  }, [supportData]);

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    setUploadProgress(0);
    if (message.trim() || files?.length > 0) {
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("content", message);
        if (files?.length > 0) {
          files?.map(
            (file) =>
              file?.size <= 5 * 1024 * 1024 && formData.append("files", file),
          );
        }
        const result = await postSupportInbox(params?.uid, formData, {
          timeout: 600000,
          onUploadProgress: (progressEvent: any) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1),
            );
            setUploadProgress(percentCompleted);
          },
        });
        if (result?.success) {
          refetch();
          setMessage("");
          setFiles([]);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isHasFile = () => {
    files?.filter((file) => file?.size <= 5 * 1024 * 1024);
    if (files?.length > 0) return true;
    else return false;
  };

  return (
    <>
      <ManualBreadcrumbs
        items={[
          { label: "Support", href: "/dashboard/support" },
          { label: "Chat", href: "/dashboard/support/" + params?.uid },
        ]}
        className="mb-5 mt-0"
      />
      <div
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="flex h-[85vh] p-4 rounded-xl bg-white font-lexend md:overflow-hidden"
      >
        <div className="flex w-full flex-col rounded-lg md:flex-row">
          {/* Chat section */}
          <div className="flex flex-1 flex-col rounded-lg border border-gray-200 max-md:h-[80vh]">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center">
                <div className="mr-3 size-10 overflow-hidden rounded-full border-2 border-accent_soft_blue">
                  {ticketData?.target?.image ? (
                    <Image
                      src={imageBaseURL + ticketData?.target?.image}
                      alt={ticketData?.target?.name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      {ticketData?.target?.name.split("")[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-lg font-medium">
                    {ticketData?.target?.name
                      ? `${ticketData?.target?.name} (Agent)`
                      : "An agent will reach you soon"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {ticketData?.target?.type}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex-1 space-y-4 overflow-y-auto p-4"
              ref={messagesContainerRef}
            >
              <PreviousMessages uid={params?.uid} />

              {uniqueMessages?.map((msg: any) => (
                <div
                  key={msg.uid}
                  className={`flex ${msg.author?.is_agent != "True" ? "justify-end" : "justify-start"}`}
                >
                  {msg?.author?.is_agent == "True" && (
                    <div
                      title={msg?.author?.name}
                      className="mr-2 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-accent_soft_blue"
                    >
                      {msg?.author?.image ? (
                        <Image
                          src={msg?.author?.image}
                          alt={msg?.author?.name}
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {msg?.author?.name.split("")[0]}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`max-w-[70%]`}>
                    {msg.content && (
                      <div
                        className={`w-full break-words rounded-lg bg-gray-200 p-3 py-2 text-gray-800 ${msg.author?.is_agent != "True" ? "rounded-tr-none bg-indigo-500 text-white" : "rounded-tl-none bg-gray-100 text-gray-800"}`}
                      >
                        {msg.content}
                      </div>
                    )}

                    {msg.file_items && msg.file_items.length > 0 && (
                      <div
                        className={`mt-2 flex flex-col gap-2 ${msg.author?.is_agent != "True" ? "text-right" : "text-left"}`}
                      >
                        {msg.file_items.map((file_item: any, idx: number) => (
                          <FileView
                            key={idx}
                            file_item={file_item}
                            isAgent={msg.author?.is_agent !== "True"}
                          />
                        ))}
                      </div>
                    )}

                    <div
                      className={`mt-1 text-xs text-gray-500 ${msg.author?.is_agent != "True" ? "text-right" : "ml-1 text-left"}`}
                    >
                      {/* {moment(msg.created_at).calendar()} */}
                      {formatChatTime(msg?.created_at)}
                      {/* {moment(msg?.created_at).startOf('hour').fromNow()} */}
                    </div>
                  </div>

                  {msg?.author?.is_agent != "True" && (
                    <div
                      title={msg?.author?.name}
                      className="ml-2 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-accent_soft_blue"
                    >
                      {msg?.author?.image ? (
                        <Image
                          src={msg?.author?.image}
                          alt={msg?.author?.name}
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {msg?.author?.name.split("")[0]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Invisible div to scroll to the bottom */}
            <div />

            {!(
              ticketData?.status == "CLOSED" ||
              ticketData?.status == "COMPLETED"
            ) && (
              <div className="border-t border-gray-200 p-3">
                {isLoading && isHasFile() && (
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                <ChatInput
                  files={files}
                  setFiles={setFiles}
                  isLoading={isLoading}
                  handleSendMessage={handleSendMessage}
                  message={message}
                  setMessage={setMessage}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col bg-white p-4 pt-0 md:w-96 md:overflow-y-auto">
            <SupportSidebar
              refetch={refetchTicket}
              isCustomer={true}
              ticketData={ticketData}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
