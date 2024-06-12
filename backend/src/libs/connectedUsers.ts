const connectedUsers = new Set<number>();

export const addConnectedUser = (id: number) => {
  connectedUsers.add(id);
};

export const removeConnectedUser = (id: number) => {
  connectedUsers.delete(id);
};

export const getConnectedUsers = () => {
  return Array.from(connectedUsers);
};
