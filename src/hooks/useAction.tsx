import { PostMultipart } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";

export const useAction = (endpoint: string) => {

  const mutation = useMutation({
    mutationFn: async ({ data, uid }: { data: FormData; uid?: string }) => {
      try {
        const url = uid ? `${endpoint}/${uid}` : endpoint; // Construct URL based on uid
        const method = uid ? "PATCH" : "POST"; // Set method based on uid presence
        const response = await PostMultipart(url, data, "", method);
        if (!response) {
          throw new Error("No response from server");
        }
        return response;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error.message ||
          "An error occurred";
        throw new Error(errorMessage);
      }
    },
  });

  return mutation;
};