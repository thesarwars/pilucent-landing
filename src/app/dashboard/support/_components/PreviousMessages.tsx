import FileView from "@/app/(admin)/admin/support/_components/FileView";
import { fetchSupportInbox } from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import { formatChatTime } from "@/utils/ChatTime";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const PreviousMessages = ({ uid }: { uid: string }) => {
  const [PreviousMessages, setPreviousMessages] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(2);
  const { data: prevMessages, isPending: isPrevLoading } = useQuery({
    queryKey: ["older_messages", uid, currentPage],
    queryFn: async () => fetchSupportInbox(uid, { page: currentPage }),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (prevMessages) {
      setPreviousMessages([...PreviousMessages, ...prevMessages?.results]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevMessages]);

  const handleLoadMore = () => {
    setCurrentPage(currentPage + 1);
  };
  return (
    <>
      {prevMessages?.next && (
        <div className="flex items-center justify-center">
          <Button
            onClick={handleLoadMore}
            isLoading={isPrevLoading}
            type="button"
            className="bg-accent_gray_400 px-2 py-1 text-sm text-white"
          >
            {isPrevLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {PreviousMessages?.toReversed()?.map((msg: any) => (
        <div
          key={msg.uid}
          className={`flex ${msg.author?.is_agent != "True" ? "justify-end" : "justify-start"}`}
        >
          {msg?.author?.is_agent == "True" && (
            <div className="mr-2 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-accent_soft_blue">
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
                className={`rounded-lg break-words p-3 py-2 ${msg.author?.is_agent != "True" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-800"}`}
              >
                {msg.content}
              </div>
            )}

            {msg.file_items && msg.file_items.length > 0 && (
              <div
                className={`mt-2 flex flex-col gap-2 ${msg.author?.is_agent == "True" ? "text-right" : "text-left"}`}
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
              className={`mt-1 text-xs text-gray-500 ${msg.author?.is_agent == "True" ? "text-right" : "ml-1 text-left"}`}
            >
              {/* {moment(msg.created_at).calendar()} */}
              {formatChatTime(msg?.created_at)}
                   {/* {moment(msg?.created_at).startOf('hour').fromNow()} */}
            </div>
          </div>

          {msg?.author?.is_agent != "True" && (
            <div className="ml-2 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-accent_soft_blue">
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
    </>
  );
};

export default PreviousMessages;
