import React, { createContext, useState } from "react";

const SearchMessageContext = createContext();

const SearchMessageProvider = ({ children }) => {
  const [searchingMessageId, setSearchingMessageId] = useState(null);

  return (
    <SearchMessageContext.Provider
      value={{ searchingMessageId, setSearchingMessageId }}
    >
      {children}
    </SearchMessageContext.Provider>
  );
};

export { SearchMessageContext, SearchMessageProvider };
