import { apiEndPoint, FromPOST } from "@/lib/FromReques/Postrequest";
import { fetchGET, fetchPatch } from "@/lib/request";
import { TypeCreateCompany, TypeDepartmentCreate, TypeDesignationCreate, TypeSectionCreate } from "@/types/company";
import axios from "axios";


export const FetchData = async (endpoint: string, token?: string, page?: string | number) => {
  const access_token = localStorage.getItem("access_token")
  const response = await axios.get(
    `${apiEndPoint}${endpoint}`, 
    {
      params: page ? { page } : {}, 
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return response.data;
};

export const DeleteData = async (endpoint: string, uid: string, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const response = await axios.delete(
      `${apiEndPoint}${endpoint}${uid}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    if (response.status === 204) {
      return { success: true, status: response.status };
    }
    return { success: false, status: response.status, message: "Unexpected response from the server." };

  } catch (error) {
    console.error("Error deleting employee:", error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, status: error.response.status, message: error.response.data };
    }
    throw error;
  }
};
export const PostData= async (endpoint:string,user: FormData | any, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await FromPOST(`${endpoint}`, {
      body: isFormData ? user : JSON.stringify(user), 
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }) 
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return {data,status:res.status}; 
  } catch (error: any) {
    console.error("Registration error:", error);
    let errorMessage: string;

    if (typeof error === "string") {
      errorMessage = error; 
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }
    return {
      success: false,
      message: errorMessage,        
    };
  }
};
export const PatchData = async (endpoint: string, user: FormData |any,uid: string, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await fetchPatch(`${endpoint}${uid}`, {
      method: 'PATCH', 
      body: isFormData ? user : JSON.stringify(user),
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return {
      success: true,
      status: res.status,  
      data: data,         
    };
  } catch (error: any) {
    console.error("Patch error:", error)
    let errorMessage: string;
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }

    return {
      success: false,
      message: errorMessage,
      status: error.response?.status || 500,  // Return status from error response if available, otherwise default to 500
    };
  }
};
export const PatchSalary= async (endpoint: string, user: FormData, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await fetchPatch(`${endpoint}`, {
      method: 'PATCH', 
      body: isFormData ? user : JSON.stringify(user),
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return {
      success: true,
      status: res.status,  
      data: data,         
    };
  } catch (error: any) {
    console.error("Patch error:", error)
    let errorMessage: string;
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }

    return {
      success: false,
      message: errorMessage,
      status: error.response?.status || 500,  // Return status from error response if available, otherwise default to 500
    };
  }
};

export const CreateCompany = async (user: TypeCreateCompany | FormData, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await FromPOST("we/companies", {
      body: isFormData ? user : JSON.stringify(user), // Use FormData directly or stringify if not FormData
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }) // Don't set Content-Type if using FormData
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return data; 
  } catch (error: any) {
    console.error("Registration error:", error);
    let errorMessage: string;

    if (typeof error === "string") {
      errorMessage = error; 
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};
export const GetCompany = async (token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const res = await fetchGET("we", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }

    return {
      success: true,
      status: res.status,
      data,
    };
  } catch (error: any) {
    console.error("Fetch company error:", error);
    let errorMessage: string;

    if (typeof error === "string") {
      errorMessage = error; 
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }

    return {
      success: false,
      status: error instanceof Response ? error.status : 500,
      message: errorMessage,
    };
  }
};
// Designation Start Hare 
export const DesignationCreate = async (user:TypeDesignationCreate | FormData, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await FromPOST("we/designations", {
      body: isFormData ? user : JSON.stringify(user), 
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }) 
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return data; 
  } catch (error: any) {
    console.error("Registration error:", error);
    let errorMessage: string;

    if (typeof error === "string") {
      errorMessage = error; 
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
};



export const CreateDepartment = async (user:TypeDepartmentCreate | FormData, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await FromPOST("we/departments", {
      body: isFormData ? user : JSON.stringify(user), 
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }) 
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return data; 
  } catch (error: any) {
    console.error("Registration error:", error);
    let errorMessage: string;

    if (typeof error === "string") {
      errorMessage = error; 
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const CreatePaymentMethod = async (user: FormData, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await FromPOST("we/payment-methods", {
      body: isFormData ? user : JSON.stringify(user),
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" })
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return data;
  } catch (error: any) {
    console.error("Payment method creation error:", error);
    let errorMessage: string;

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const CreateCurrency = async (user: FormData, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await FromPOST("we/currencies/", {
      body: isFormData ? user : JSON.stringify(user),
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" })
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return data;
  } catch (error: any) {
    console.error("Currency creation error:", error);
    let errorMessage: string;

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// new function
export const PostRequest = async (
  endpoint: string,
  token?: string, 
  data?: Record<string, any> 
) => {
  const access_token = localStorage.getItem("access_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
    headers.Authorization = `Bearer ${access_token}`;
 
  const response = await axios.post(
    `${apiEndPoint}${endpoint}`,
    data || {},
    { headers }
  );
  return response;
};

export const GetRequest = async (
  endpoint: string,
  token?: string,
  params?: Record<string, any>
) => {
  const access_token = localStorage.getItem("access_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (access_token) {
    headers.Authorization = `Bearer ${access_token}`;
  }
  const response = await axios.get(`${apiEndPoint}${endpoint}`, {
    headers,
    params, 
  });
  return response;
};
// for  Sarower vai 
export const PatchDataAdmin = async (endpoint: string, user: FormData |any, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await fetchPatch(`${endpoint}`, {
      method: 'PATCH', 
      body: isFormData ? user : JSON.stringify(user),
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return {
      success: true,
      status: res.status,  
      data: data,         
    };
  } catch (error: any) {
    console.error("Patch error:", error)
    let errorMessage: string;
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }

    return {
      success: false,
      message: errorMessage,
      status: error.response?.status || 500,  // Return status from error response if available, otherwise default to 500
    };
  }
};

export const CreateChartOfAccount = async (user: FormData | any, token?: string) => {
  const access_token = localStorage.getItem("access_token")
  try {
    const isFormData = user instanceof FormData;
    const res = await FromPOST("we/chart-of-accounts", {
      body: isFormData ? user : JSON.stringify(user),
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" })
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    return data;
  } catch (error: any) {
    console.error("Chart of account creation error:", error);
    let errorMessage: string;

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred.";
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Create