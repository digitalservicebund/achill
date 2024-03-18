import { Api } from "nocodb-sdk";

const api = new Api({
  baseURL: process.env.NOCODB_BASE_URL,
  headers: {
    "xc-token": process.env.NOCODB_API_TOKEN,
  },
});

export default api;
