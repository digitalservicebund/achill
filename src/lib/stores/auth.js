import { writable } from "svelte/store";

export const loggedIn = writable(false);
export const user = writable({});

export const login = (userName, password) => {
  user.set({
    name: userName,
    password,
  });
  loggedIn.set(true);
};

export const logout = () => {
  user.set({});
  loggedIn.set(false);
};
