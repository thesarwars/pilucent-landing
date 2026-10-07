
import { fetchPOST } from "@/lib/request";

export const registerUser = async (user: TUserRegData) => {
  try {
    const res = await fetchPOST("accounts/register", {
      body: JSON.stringify(user),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }
    console.log(data);
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

export const signInUser = async (user: { password: string; email: string }) => {
  try {
    const res = await fetchPOST("accounts/auth/token", {
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data)); 
    }
    return data; 
  } catch (error: any) {
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
export const forgetPassword = async (email: string) => {
  try {
    const res = await fetchPOST("accounts/forget-password/sent-link", {
      body: JSON.stringify({ email }), // Send only the email
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || JSON.stringify(data)); // Improved error message handling
    }
    console.log("Password reset link sent successfully:", data);
    return data;

  } catch (error: any) {
    console.error("Forgot password error:", error); // Log error for debugging
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


export const logoutUser = async (id: string) => {
  try {
    const res = await fetchPOST("/logout", {
      body: JSON.stringify({
        user_id: id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const checkEmail = async (email: string) => {
  try {
    const res = await fetchPOST("/check-email", {
      body: JSON.stringify({
        email: email,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw data;
    }

    if (data.message === "Email is available.") return false;

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const verifyEmail = async (id: string) => {
  try {
    const res = await fetchPOST("/email/verify", {
      body: JSON.stringify({
        user_id: id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const verifyOTP = async (id: string, otp: number) => {
  try {
    const res = await fetchPOST("/email/verify/otp", {
      body: JSON.stringify({
        user_id: id,
        otp: otp,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw data;
    }

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
