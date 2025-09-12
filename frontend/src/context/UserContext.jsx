import { createContext } from "react";

export const UserContext = createContext({
  user: null, 
  username: null,
  setUser: () => {},
  setUsername: () => {}
});

