import { toast } from "@/lib/ToastService";
import axios from "axios";

// The Pilucent API. Set NEXT_PUBLIC_API_URL per environment (see .env.example);
// the default is the local Docker backend.
export const baseURL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

export const axiosApi = axios.create({
  baseURL: baseURL,
});

axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     localStorage.removeItem("access_token");
//     location.reload();
//     return Promise.reject(error);
//   },
// );

export async function get(url, params = {}, config = {}) {
  const response = await axiosApi.get(url, { ...config, params });
  return response.data;
}
export async function getAxios(url, params = {}, config = {}) {
  axiosApi
    .get(url, { ...config, params })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });
}

const updateRequest = (url, data) => {
  // axiosApi.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token") ?? ""
  //   }`;
  axiosApi.defaults.headers.common["Content-Type"] = "application/json";
  let variables = url.match(/:[a-zA-Z]+/g);
  if (variables?.length) {
    variables.forEach((variable) => {
      url = url.replace(variable, data[variable.replace(":", "")]);
      delete data[variable.replace(":", "")];
    });
  }
  return { url, data };
};

export async function post(
  url,
  data,
  config = {},
  showAlert = true,
  isReturnError = false,
) {
  let { url: newUrl, data: newData } = updateRequest(url, data);
  try {
    return axiosApi
      .post(newUrl, newData, { ...config })
      .then((response) => {
        return { ...response.data, success: true };
      })
      .catch((error) => {
        if (isReturnError) {
          throw error;
        }
        try {
          let errors;
          if (!showAlert) {
            return;
          }
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          showAlert && toast.error("Something Went Wrong");
        }

        //throw error;
      });
  } catch (err) {
    showAlert && toast.error("Something Went Wrong");
  }
}

export async function postThroughMapping(url, data, config = {}) {
  let { url: newUrl, data: newData } = updateRequest(url, data);
  try {
    return axiosApi
      .post(newUrl, newData, { ...config })
      .then((response) => {
        return { ...response.data, success: true };
      })
      .catch((error) => {
        throw error;
      });
  } catch (err) {
    throw err;
  }
}

//
export async function postAxiosMultipart(url, data, config = {}) {
  axiosApi.defaults.headers.common["Content-Type"] = "";
  try {
    return axiosApi
      .post(url, data, { ...config })
      .then((response) => {
        return { ...response.data, success: true };
      })
      .catch((error) => {
        try {
          let errors;
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          toast.error("Something went wrong");
          throw err;
        }
        console.error(
          "🚀 ~ post ~ error:",
          error.response ? error.response.data : error.message,
        );
        //throw error;
      });
  } catch (err) {
    throw err;
  }
}
export async function patchAxiosMultipart(url, data, config = {}) {
  axiosApi.defaults.headers.common["Content-Type"] = "";
  try {
    return axiosApi
      .patch(url, data, { ...config })
      .then((response) => {
        console.log("🚀 ~ post ~ response:", response.data);
        return { ...response.data, success: true };
      })
      .catch((error) => {
        try {
          let errors;
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          toast.error("Something went wrong");
          throw err;
        }
        console.error(
          "🚀 ~ post ~ error:",
          error.response ? error.response.data : error.message,
        );
        //throw error;
      });
  } catch (err) {
    // toast.error("Something Went Wrong");
    throw err;
  }
}

export async function postFormData(url, data, config = {}) {
  let formData = convertObjectToFormData(data);
  console.log("🚀 ~ postForm ~ url:", url);
  console.log("🚀 ~ postForm ~ formData:", formData);
  try {
    return axiosApi
      .post(url, formData, { ...config })
      .then((response) => {
        console.log("🚀 ~ postForm ~ response:", response.data);
        return { ...response.data, success: true };
      })
      .catch((error) => {
        try {
          let errors;
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          toast.error("Something Went Wrong");
        }
        console.error(
          "🚀 ~ postForm ~ error:",
          error.response ? error.response.data : error.message,
        );
        //throw error;
      });
  } catch (err) {
    toast.error("Something Went Wrong");
  }
}

export async function patchFormData(url, data, config = {}) {
  axiosApi.defaults.headers.common["Content-Type"] = "";
  let formData = convertObjectToFormData(data);
  console.log("🚀 ~ postForm ~ url:", url);
  console.log("🚀 ~ postForm ~ formData:", formData);
  try {
    return axiosApi
      .patch(url, formData, { ...config })
      .then((response) => {
        console.log("🚀 ~ postForm ~ response:", response.data);
        return { ...response.data, success: true };
      })
      .catch((error) => {
        try {
          let errors;
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          toast.error("Something Went Wrong");
        }
        console.error(
          "🚀 ~ postForm ~ error:",
          error.response ? error.response.data : error.message,
        );
        //throw error;
      });
  } catch (err) {
    toast.error("Something Went Wrong");
  }
}

export async function patch(url, data, config = {}, isReturnError) {
  let { url: newUrl, data: newData } = updateRequest(url, data);
  try {
    return axiosApi
      .patch(newUrl, newData, { ...config })
      .then((response) => {
        return { ...response.data, success: true };
      })
      .catch((error) => {
        if (isReturnError) {
          throw error;
        }
        try {
          let errors;
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          toast.error("Something Went Wrong");
        }
      });
  } catch (err) {
    toast.error("Something Went Wrong");
  }
}
export async function put(url, data, config = {}, isReturnError) {
  let { url: newUrl, data: newData } = updateRequest(url, data);
  try {
    return axiosApi
      .put(newUrl, newData, { ...config })
      .then((response) => {
        return { ...response.data, success: true };
      })
      .catch((error) => {
        if (isReturnError) {
          throw error;
        }
        try {
          let errors;
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          toast.error("Something Went Wrong");
        }
      });
  } catch (err) {
    toast.error("Something Went Wrong");
  }
}

export async function del(url, config = {}, isReturnError = false) {
  try {
    return await axiosApi
      .delete(url, { ...config })
      .then((response) => {
        return { ...response.data, success: true };
      })
      .catch((error) => {
        if (isReturnError) {
          throw error;
        }
        try {
          let errors;
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          toast.error("Something Went Wrong");
        }
      });
  } catch (err) {
    toast.error("Something Went Wrong");
  }
}

export const convertObjectToFormData = (object) => {
  let form_data = new FormData();
  for (let key in object) {
    if (object[key] !== null && object[key] !== undefined) {
      if (Array.isArray(object[key])) {
        object[key].forEach((item) => {
          form_data.append(key, item);
        });
      } else {
        form_data.append(key, object[key]);
      }
    }
  }
  return form_data;
};

//only for expense and sales
export async function patchFormDataES(url, data, config = {}, files) {
  let formData = convertObjectToFormDataES(data, files);
  console.log("🚀 ~ postForm ~ url:", url);
  console.log("🚀 ~ postForm ~ formData:", formData);
  try {
    return axiosApi
      .patch(url, formData, { ...config })
      .then((response) => {
        console.log("🚀 ~ postForm ~ response:", response);

        return { ...response.data, success: true };
      })
      .catch((error) => {
        try {
          let errors;
          if (error.response ? error.response.data : error.message)
            (errors = error.response ? error.response.data : error.message),
              Object.keys(errors)?.forEach((key) => {
                const errorMessages = errors[key];
                errorMessages?.forEach((message) => {
                  toast.error(
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                  );
                });
              });
        } catch (err) {
          toast.error("Something Went Wrong");
        }
        console.error(
          "🚀 ~ postForm ~ error:",
          error.response ? error.response.data : error.message,
        );
        //throw error(error.response ? error.response.data : error.message);
      });
  } catch (err) {
    toast.error("Something Went Wrong");
  }
}

//only for expense and sales
export const convertObjectToFormDataES = (object, files) => {
  let form_data = new FormData();
  for (let key in object) {
    if (object[key] !== null && object[key] !== undefined) {
      if (Array.isArray(object[key])) {
        object[key].forEach((item) => {
          form_data.append(key, item);
        });
      } else {
        form_data.append(key, object[key]);
      }
    }
  }
  if (files?.length > 0) {
    files.map((file) => form_data.append("files", file));
  }
  return form_data;
};
