type MessageId = string | number;

interface Message {
  id?: MessageId,
  type?: string,
  priority?: number,
  lifetime?: number,
  expiry?: Date,
  timeoutId?: Timer
}
