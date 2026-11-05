/**
 * Application message manager: one store for global, component and field
 * messages from validation, API responses, application events and background
 * operations, consumed by MessagePopover, MessageStrip, MessageView and toasts.
 */
export {
  MessageStore,
  createMessageStore,
  matchesMessage,
  compareMessages,
  countMessages,
  highestSeverity,
  type AppMessage,
  type MessageInput,
  type MessageFilter,
  type MessageScope,
  type MessageSource,
} from './MessageStore';
export {
  messagesFromApiError,
  messagesFromResponse,
  messagesFromFormErrors,
  severityToType,
  trackOperation,
  type ApiMessageOptions,
  type TrackOperationOptions,
} from './sources';
export {
  MessageManagerProvider,
  useMessageStore,
  useMessages,
  useFieldMessage,
  useFormMessages,
  type MessageManagerProviderProps,
  type FieldMessageState,
  type UseFormMessagesOptions,
} from './MessageManagerProvider';
export { MessageView, focusMessageTarget, type MessageViewProps, type MessageViewLabels } from './message-view/MessageView';
export {
  ManagedMessagePopover,
  ManagedMessageStrips,
  ManagedMessageView,
  MessageToastBridge,
  type ManagedMessagePopoverProps,
  type ManagedMessageStripsProps,
  type ManagedMessageViewProps,
  type MessageToastBridgeProps,
} from './consumers';
