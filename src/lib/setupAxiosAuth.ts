import axios from "axios";

/**
 * Backend 401 qaytarsa (sessiya yo'q/eskirgan) — eski memberData'ni tozalab,
 * login sahifasiga yo'naltiradi. Aks holda frontend "login qilingan" deb
 * hisoblab, har bir so'rovda 401 bilan to'qnashishda davom etadi.
 */
export function setupAxiosAuth(): void {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && window.location.pathname !== "/login") {
        localStorage.removeItem("memberData");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
}
