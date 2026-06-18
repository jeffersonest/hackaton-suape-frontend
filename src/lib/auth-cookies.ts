"use client";

import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "suape_access_token";
const REFRESH_TOKEN_KEY = "suape_refresh_token";

export const authCookies = {
  setAccessToken: (token: string, expires = 7) => {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });
  },

  getAccessToken: () => {
    return Cookies.get(ACCESS_TOKEN_KEY);
  },

  setRefreshToken: (token: string) => {
    Cookies.set(REFRESH_TOKEN_KEY, token, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });
  },

  getRefreshToken: () => {
    return Cookies.get(REFRESH_TOKEN_KEY);
  },

  clearTokens: () => {
    Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
    Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  },
};
