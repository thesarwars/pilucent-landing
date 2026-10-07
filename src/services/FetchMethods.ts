import { baseURL as base_URL } from "@/app/helpers/api";

export const baseURL = base_URL + "/";
const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

const Post = async <T>(
  url: string,
  { body, token }: { body: any; token?: string },
): Promise<T> => {
  const access_token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: "POST",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = await response.json();

      throw new Error(JSON.stringify(errorMessage));
    }

    return response.status !== 204 ? response.json() : (null as T);
  } catch (error) {
    console.error("POST Client Error:", error);
    throw error;
  }
};

const PostMultipart = async <T>(
  url: string,
  formData: FormData,
  token?: string,
  method: "POST" | "PATCH" = "POST", // Add method parameter with default value
): Promise<T> => {
  const access_token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method, // Use the method parameter
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
      body: formData,
    });

    // Debug the raw response
    const responseText = await response.text();
    console.log("Raw Response:", responseText);

    if (!response.ok) {
      throw new Error(`${responseText}`);
    }

    return JSON.parse(responseText) as T; // Parse JSON only if valid
  } catch (error) {
    console.error("POST Client Error:", error);
    throw error;
  }
};

const UploadMultipart = async <T>(
  url: string,
  formData: FormData,
  token?: string,
): Promise<T> => {
  const access_token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
      body: formData,
    });

    // Debug the raw response
    const responseText = await response.text();
    // console.log("Raw Response:", responseText);

    if (!response.ok) {
      throw new Error(`${responseText}`);
    }

    return JSON.parse(responseText) as T; // Parse JSON only if valid
  } catch (error) {
    console.error("POST Client Error:", error);
    throw error;
  }
};

const GetData = async (url: string, token?: string) => {
  const access_token = localStorage.getItem("access_token");
  const response = await fetch(`${baseURL}${url}`, {
    method: "GET",
    headers: {
      ...defaultHeaders,
      Authorization: `Bearer ${access_token}`,
    },
  });
  const data = await response.json();
  // console.log(response);
  return data;
};

const PatchMultipart = async <T>(
  url: string,
  body: any,
  token?: string,
): Promise<T> => {
  const access_token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: "PATCH",
      headers: {
        //  "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
      body: body,
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`${errorMessage}`);
    }

    return response.status !== 204 ? response.json() : (null as T);
  } catch (error) {
    console.error("PUT Client Error:", error);
    throw error;
  }
};

const Patch = async <T>(url: string, body: any, token?: string): Promise<T> => {
  const access_token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: "PATCH",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`${errorMessage}`);
    }

    return response.status !== 204 ? response.json() : (null as T);
  } catch (error) {
    console.error("PATCH Client Error:", error);
    throw error;
  }
};

const Put = async <T>(url: string, body: any, token?: string): Promise<T> => {
  const access_token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: "PUT",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`${errorMessage}`);
    }

    return response.status !== 204 ? response.json() : (null as T);
  } catch (error) {
    console.error("PATCH Client Error:", error);
    throw error;
  }
};

const DeleteData = async (url: string, token?: string) => {
  const access_token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: "DELETE",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      // `message` stays the raw body so existing callers that JSON.parse it keep
      // working. `status` is attached so callers can tell 409 (the account has
      // ledger history) from 400 — see FRONTEND_INSTRUCTIONS_COA.md §2.
      const err = new Error(`${errorMessage}`) as Error & { status?: number; body?: string };
      err.status = response.status;
      err.body = errorMessage;
      throw err;
    }

    return { success: true };
  } catch (error) {
    console.error("DELETE Client Error:", error);
    throw error;
  }
};

const GetProductData = async (uid: string, token?: string) => {
  const access_token = localStorage.getItem("access_token");
  const response = await fetch(`${baseURL}we/products/${uid}`, {
    method: "GET",
    headers: {
      ...defaultHeaders,
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`${errorMessage}`);
  }

  return response.json();
};

// export const GetUserData = async (token: string) => {
//   try {
//     const res = await GetData("me", token);
//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(JSON.stringify(data));
//     }

//     return {
//       success: true,
//       status: res.status,
//       data,
//     };
//   } catch (error: any) {
//     console.error("Fetch user error:", error);
//     let errorMessage: string;

//     if (typeof error === "string") {
//       errorMessage = error;
//     } else if (error instanceof Error) {
//       errorMessage = error.message;
//     } else {
//       errorMessage = "An unexpected error occurred.";
//     }

//     return {
//       success: false,
//       status: error instanceof Response ? error.status : 500,
//       message: errorMessage,
//     };
//   }
// };

export {
  Post,
  GetData,
  PatchMultipart,
  DeleteData,
  Patch,
  PostMultipart,
  UploadMultipart,
  Put,
  GetProductData,
};
