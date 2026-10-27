import axios from "axios";
import { toast } from 'sonner'

export const baseURL = "https://balanzifyapi.jumatechs.xyz/api/v1";

const axiosApi = axios.create({
  baseURL: baseURL,
});

axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export async function get(url, params = {}, config = {}) {
  const response = await axiosApi.get(url, { ...config, params });
  console.log("🚀 ~ get ~ response:", response.data);
  return response.data;
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

export async function post(url, data, config = {}) {
  let { url: newUrl, data: newData } = updateRequest(url, data);
  // console.log("🚀 ~ post ~ newUrl:", newUrl);
  // console.log("🚀 ~ post ~ newData:", newData);
  try {
    return axiosApi
      .post(newUrl, newData, { ...config })
      .then((response) => {
        // console.log("🚀 ~ post ~ response:", response.data);
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
                    `${key.split("_").join(" ").toUpperCase()} : ${message}`
                  );
                });
              });
        } catch (err) {
          toast.error("Something Went Wrong");
        }
        console.error(
          "🚀 ~ post ~ error:",
          error.response ? error.response.data : error.message,
        );
        //throw error;
      });
  } catch (err) {
    toast.error("Something Went Wrong");
  }
}



//






export async function patch(url, data, config = {}) {
  let { url: newUrl, data: newData } = updateRequest(url, data);
  try {
    return axiosApi
      .patch(newUrl, newData, { ...config })
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
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`
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

export async function del(url, config = {}) {
  try {
    return await axiosApi
      .delete(url, { ...config })
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
                    `${key.split("_").join(" ").toUpperCase()} :- ${message}`
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
