interface ViewActions {
  navigate(path: string)
};

interface MessageActions {
  create(message: Message),
  acknowledge(id: MessageId),
  remove(id: MessageId)
};
