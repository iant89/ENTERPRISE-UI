import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { defaultMessages, type MetadataMessages } from './engine/messages';
import type { FieldType } from './engine/schema';
import type { FieldControlRenderer } from './field-renderer/FieldRenderer';

/** Settings shared by every Smart component below a {@link MetadataProvider}. */
export interface MetadataContextValue {
  /** BCP 47 locale for numbers, currencies and dates. Defaults to the browser locale. */
  locale?: string;
  /** Resolved strings (defaults merged with overrides). */
  messages: MetadataMessages;
  /** Controls by field type that replace the built-in ones. */
  renderers: Partial<Record<FieldType, FieldControlRenderer>>;
}

const MetadataContext = createContext<MetadataContextValue>({ messages: defaultMessages, renderers: {} });

export interface MetadataProviderProps {
  /** BCP 47 locale for numbers, currencies and dates. Defaults to the browser locale. */
  locale?: string;
  /** Overrides for validation messages and built-in strings. */
  messages?: Partial<MetadataMessages>;
  /** Controls by field type that replace the built-in renderers, e.g. a ComboBox for `enum`. */
  renderers?: Partial<Record<FieldType, FieldControlRenderer>>;
  /** Content that uses the settings. */
  children: ReactNode;
}

/** Provides the locale, strings and custom field renderers to SmartField, SmartForm, SmartFilterBar, SmartTable and SmartChart. Nested providers inherit from their parent. */
export function MetadataProvider({ locale, messages, renderers, children }: MetadataProviderProps) {
  const parent = useContext(MetadataContext);
  const value = useMemo<MetadataContextValue>(
    () => ({
      locale: locale ?? parent.locale,
      messages: { ...parent.messages, ...messages },
      renderers: { ...parent.renderers, ...renderers },
    }),
    [locale, messages, renderers, parent],
  );
  return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>;
}

/** Reads the nearest {@link MetadataProvider} settings (English defaults without one). */
export const useMetadata = () => useContext(MetadataContext);
