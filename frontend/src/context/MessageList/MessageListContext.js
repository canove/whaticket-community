import React, { createContext, useReducer } from 'react';

const MessageListContext = createContext();

const reducer = (state, action) => {
  if (action.type === 'LOAD_MESSAGES') {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === 'ADD_MESSAGE') {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === 'UPDATE_MESSAGE') {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === 'RESET') {
    return [];
  }
};

const MessageListProvider = ({ children }) => {
  const [messagesList, dispatch] = useReducer(reducer, []);

  return (
    <MessageListContext.Provider value={{ messagesList, dispatch }}>
      {children}
    </MessageListContext.Provider>
  );
};

export { MessageListContext, MessageListProvider };
