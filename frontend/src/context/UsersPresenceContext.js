import React, { createContext, useState } from "react";

const UsersPresenceContext = createContext();

const UsersPresenceProvider = ({ children }) => {
  const [connectedUsers, setConnectedUsers] = useState([]);

  return (
    <UsersPresenceContext.Provider
      value={{ connectedUsers, setConnectedUsers }}
    >
      {children}
    </UsersPresenceContext.Provider>
  );
};

export { UsersPresenceContext, UsersPresenceProvider };
