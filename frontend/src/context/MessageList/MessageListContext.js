import React, { createContext, useReducer, useState, useRef } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [messagesList, dispatch] = useReducer(reducer, []);
  const [referedMessage, setReferedMessage] = useState(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const messageRef = useRef({});

  const scrollToMessage = (messageId) => {
    const selectedMessage = messageRef.current[messageId];
    if (selectedMessage) {
      selectedMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setReferedMessage(messageId);
      setIsPulsing(true);
      setTimeout(() => {
        setIsPulsing(false);
      }, 1500);
    }
  };

  return (
    <MessageListContext.Provider
      value={{
        messagesList,
        dispatch,
        isOpen,
        setIsOpen,
        scrollToMessage,
        messageRef,
        referedMessage,
        isPulsing,
      }}
    >
      {children}
    </MessageListContext.Provider>
  );
};

export { MessageListContext, MessageListProvider };
