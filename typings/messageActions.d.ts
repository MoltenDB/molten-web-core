
export interface MessageAddAction {
  type: MDB_MESSAGE_ADD,
  message: 
}

export interface MessageAcknowledgeAction {
  type: MDB_MESSAGE_ACKNOWLEDGE,
  messageId: MessageId
}

export interface MessageTimeoutAction {
  type: MDB_MESSAGE_TIMEOUT,
  messageId: MessageId
}
