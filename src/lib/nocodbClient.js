import { Api } from "nocodb-sdk";

const api = new Api({
  baseURL: "https://metrics.ds4g.dev:38081",
  headers: {
    "xc-token": "08PVE0-Pv0I_bwn_CdHra0yz_ZCQ5I6BJNZKzZrX",
  },
});

export default api;
