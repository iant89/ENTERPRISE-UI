import { normalizeName, parseIconId, toUri } from './identifier';
import { IconResolver, type ResolveOptions } from './IconResolver';
import type {
  IconAssetSource, IconCollectionInfo, IconCollectionRegistration, IconDefinition, IconMetadata, IconRegistration, IconRenderProvider, IconResolution,
} from './types';

const PREFIX = '[ENTERPRISE-UI]';

/** Internal, mutable state of one collection. */
export interface CollectionState {
  name: string;
  provider: string;
  label: string;
  description?: string;
  schemes: string[];
  definitions: Map<string, IconDefinition>;
  /** alias → icon name, within the collection. */
  aliases: Map<string, string>;
  codePoints: Map<number, string>;
  resolveIcon?: IconCollectionRegistration['resolveIcon'];
  load?: IconCollectionRegistration['load'];
  loading?: Promise<void>;
  loaded: boolean;
  loadMetadata?: IconCollectionRegistration['loadMetadata'];
  metadataLoading?: Promise<void>;
}

/** Options for registrations that may replace existing entries. */
export interface RegisterOptions {
  /** Replace an existing entry instead of throwing. @default false */
  override?: boolean;
}

export interface SearchOptions {
  /** Only search this collection. */
  collection?: string;
  /** Maximum number of results. @default 50 */
  limit?: number;
}

/** Turns the string shorthand of a registration into a typed source for the given provider. */
function toSource(provider: string, source: string | IconAssetSource): IconAssetSource {
  if (typeof source !== 'string') return source;
  const s = source.trim();
  switch (provider) {
    case 'svg':
      if (s.startsWith('<')) return { type: 'svg-markup', markup: s };
      if (/^[Mm][\s\d.,-]/.test(s)) return { type: 'svg-path', d: s };
      return { type: 'svg-url', url: s };
    case 'font': return { type: 'glyph', glyph: s };
    case 'fontawesome': return { type: 'fontawesome', icon: s };
    case 'material': return { type: 'material', ligature: s };
    default: return { type: 'custom', data: s };
  }
}

const freeze = <T extends object>(value: T): Readonly<T> => Object.freeze(value);

/**
 * The icon registry: collections of icon definitions, aliases and rendering providers.
 * It is independent of any component and of how icons are drawn (it never touches the DOM),
 * so an icon library can be swapped or added without changing `<Icon>` or the components using it.
 */
export class IconRegistry {
  private readonly collections = new Map<string, CollectionState>();
  /** Extra URI schemes → collection name. */
  private readonly schemeMap = new Map<string, string>();
  /** Cross-collection aliases: `collection://alias` → target identifier. */
  private readonly uriAliases = new Map<string, string>();
  private readonly providers = new Map<string, IconRenderProvider>();
  private readonly listeners = new Set<() => void>();
  private readonly warned = new Set<string>();
  private readonly resolver = new IconResolver(this);
  private defaultCollection = 'enterprise';
  private fallback: string | null = null;
  private warnings = true;
  private version = 0;

  // ── Providers ────────────────────────────────────────────────────────────

  /** Adds a rendering provider. Definitions name their provider, so new libraries need no component changes. */
  addProvider(name: string, provider: IconRenderProvider, options: RegisterOptions = {}): this {
    if (this.providers.has(name) && !options.override) throw new Error(`${PREFIX} Icon provider "${name}" is already registered. Pass { override: true } to replace it.`);
    this.providers.set(name, provider);
    return this.changed();
  }

  removeProvider(name: string): boolean {
    const removed = this.providers.delete(name);
    if (removed) this.changed();
    return removed;
  }

  getProvider(name: string): IconRenderProvider | undefined {
    return this.providers.get(name);
  }

  /** Names of the registered providers. */
  listProviders(): string[] {
    return [...this.providers.keys()];
  }

  // ── Collections ──────────────────────────────────────────────────────────

  /** Registers a whole icon library. Lazy collections (`load`) are fetched on first use. */
  registerCollection(collection: IconCollectionRegistration, options: RegisterOptions = {}): this {
    const name = normalizeName(collection.name);
    if (this.collections.has(name) && !options.override) throw new Error(`${PREFIX} Icon collection "${name}" is already registered. Pass { override: true } to replace it.`);
    if (this.collections.has(name)) this.unregisterCollection(name);
    const state: CollectionState = {
      name,
      provider: collection.provider ?? 'svg',
      label: collection.label ?? name,
      description: collection.description,
      schemes: (collection.schemes ?? []).map(normalizeName),
      definitions: new Map(),
      aliases: new Map(),
      codePoints: new Map(),
      resolveIcon: collection.resolveIcon,
      load: collection.load,
      loaded: !collection.load,
      loadMetadata: collection.loadMetadata,
    };
    this.collections.set(name, state);
    for (const scheme of state.schemes) this.schemeMap.set(scheme, name);
    this.fill(state, collection);
    return this.changed();
  }

  unregisterCollection(name: string): boolean {
    const key = normalizeName(name);
    const state = this.collections.get(key);
    if (!state) return false;
    for (const scheme of state.schemes) this.schemeMap.delete(scheme);
    this.collections.delete(key);
    this.changed();
    return true;
  }

  /** Read-only information about every collection. */
  listCollections(): IconCollectionInfo[] {
    return [...this.collections.values()].map((c) => freeze({
      name: c.name, provider: c.provider, label: c.label, description: c.description, schemes: [...c.schemes],
      size: c.definitions.size, open: !!c.resolveIcon, loaded: c.loaded,
    }));
  }

  /** The collection that plain names (`edit`) resolve against. @default 'enterprise' */
  setDefaultCollection(name: string): this {
    this.defaultCollection = normalizeName(name);
    return this.changed();
  }

  getDefaultCollection(): string {
    return this.defaultCollection;
  }

  /**
   * Loads lazy collections (all, or the one named) so icons render without a loading step.
   * With `metadata`, also loads categories and keywords for search.
   */
  async preload(collection?: string, options: { metadata?: boolean } = {}): Promise<void> {
    const states = collection ? [this.getCollectionState(collection)].filter(Boolean) as CollectionState[] : [...this.collections.values()];
    await Promise.all(states.map(async (s) => {
      await this.loadCollection(s);
      if (options.metadata) await this.loadMetadata(s);
    }));
  }

  // ── Icons ────────────────────────────────────────────────────────────────

  /** Registers one icon. Throws if it already exists, unless `override` is set. */
  register(icon: IconRegistration, options: RegisterOptions = {}): this {
    const collection = normalizeName(icon.collection ?? this.defaultCollection);
    let state = this.collections.get(collection);
    if (!state) {
      this.registerCollection({ name: collection, provider: icon.provider });
      state = this.collections.get(collection)!;
    }
    this.addDefinition(state, icon, options);
    return this.changed();
  }

  /** Removes an icon (by name or URI) and its aliases. */
  unregister(id: string): boolean {
    const target = this.locate(id);
    if (!target) return false;
    const { state, name } = target;
    const def = state.definitions.get(name)!;
    state.definitions.delete(name);
    for (const [alias, to] of state.aliases) if (to === name) state.aliases.delete(alias);
    if (def.metadata.codePoint !== undefined && state.codePoints.get(def.metadata.codePoint) === name) state.codePoints.delete(def.metadata.codePoint);
    this.changed();
    return true;
  }

  /**
   * Makes `alias` resolve to `target`. Both are names (in the default collection) or URIs, and may
   * be in different collections: `registerAlias('enterprise://modify', 'enterprise://edit')`.
   */
  registerAlias(alias: string, target: string, options: RegisterOptions = {}): this {
    const from = this.toUriKey(alias);
    const to = this.toUriKey(target);
    if (!from || !to) throw new Error(`${PREFIX} Invalid icon alias "${alias}" → "${target}".`);
    if (from === to) throw new Error(`${PREFIX} Icon alias "${alias}" points to itself.`);
    const [fromCollection, fromName] = from.split('://');
    const state = this.collections.get(fromCollection);
    const existing = this.uriAliases.has(from) || state?.aliases.has(fromName) || state?.definitions.has(fromName);
    if (existing && !options.override) throw new Error(`${PREFIX} "${from}" is already an icon or alias. Pass { override: true } to replace it.`);
    const [toCollection, toName] = to.split('://');
    if (state && toCollection === fromCollection) {
      state.aliases.set(fromName, toName);
      const def = state.definitions.get(toName);
      if (def && !def.aliases.includes(fromName)) state.definitions.set(toName, freeze({ ...def, aliases: freeze([...def.aliases, fromName]) }));
    } else {
      this.uriAliases.set(from, to);
    }
    return this.changed();
  }

  unregisterAlias(alias: string): boolean {
    const from = this.toUriKey(alias);
    if (!from) return false;
    const [collection, name] = from.split('://');
    const removed = this.uriAliases.delete(from) || !!this.collections.get(collection)?.aliases.delete(name);
    if (removed) this.changed();
    return removed;
  }

  /** The definition for an identifier (aliases followed), without fallback. Lazy collections must be loaded. */
  get(id: string | number, options: ResolveOptions = {}): IconDefinition | undefined {
    const result = this.resolver.resolve(id, { ...options, fallback: false, warn: false, assets: false });
    return result.status === 'resolved' ? result.definition : undefined;
  }

  /** Whether an identifier resolves to an icon (lazy collections must be loaded). */
  has(id: string | number, options: ResolveOptions = {}): boolean {
    return this.get(id, options) !== undefined;
  }

  /**
   * Resolves an identifier to a definition and the provider that draws it. Plain names use the
   * default collection (or `options.collection`). Unknown icons use the fallback when set and log a
   * development warning once; lazy collections and assets report `pending` while they load.
   */
  resolve(id: string | number, options: ResolveOptions = {}): IconResolution {
    return this.resolver.resolve(id, options);
  }

  /** Every definition (in loaded collections), optionally for one collection, sorted by URI. */
  list(options: { collection?: string } = {}): IconDefinition[] {
    const states = options.collection ? [this.getCollectionState(options.collection)].filter(Boolean) as CollectionState[] : [...this.collections.values()];
    return states.flatMap((s) => [...s.definitions.values()]).sort((a, b) => a.uri.localeCompare(b.uri));
  }

  /**
   * Finds icons by name, alias, category, keyword or label in loaded collections. Results are ranked:
   * exact name, then name prefix, alias, other name matches, then metadata. "barcode" matches "bar-code".
   */
  search(query: string, options: SearchOptions = {}): IconDefinition[] {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const all = this.list({ collection: options.collection });
    if (!terms.length) return all.slice(0, options.limit ?? 50);
    const compact = (s: string) => s.replace(/[\s_-]+/g, '');
    const scored: [number, IconDefinition][] = [];
    for (const def of all) {
      let total = 0;
      for (const term of terms) {
        const t = compact(term);
        const name = compact(def.name);
        const aliases = def.aliases.map(compact);
        const meta = [def.metadata.category ?? '', def.metadata.label ?? '', ...(def.metadata.keywords ?? [])].map((x) => compact(x.toLowerCase()));
        const score = name === t ? 100 : name.startsWith(t) ? 60 : aliases.some((a) => a === t || a.startsWith(t)) ? 50 : name.includes(t) ? 40
          : aliases.some((a) => a.includes(t)) ? 30 : meta.some((m) => m.includes(t)) ? 10 : 0;
        if (!score) { total = 0; break; }
        total += score;
      }
      if (total) scored.push([total, def]);
    }
    return scored.sort((a, b) => b[0] - a[0] || a[1].uri.localeCompare(b[1].uri)).slice(0, options.limit ?? 50).map(([, d]) => d);
  }

  // ── Fallback, warnings, change notification ──────────────────────────────

  /** Icon drawn for unknown identifiers, or `null` to draw nothing. */
  setFallback(id: string | null): this {
    this.fallback = id;
    return this.changed();
  }

  getFallback(): string | null {
    return this.fallback;
  }

  /** Turns the development warning for unknown icons on or off. It is never shown in production builds. */
  setWarnings(enabled: boolean): this {
    this.warnings = enabled;
    return this;
  }

  /** Called after every change (registration, a lazy collection or asset finishing loading). */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  /** Increases with every change; lets UIs re-render cheaply. */
  getVersion(): number {
    return this.version;
  }

  // ── Internal: used by IconResolver ───────────────────────────────────────

  /** @internal */
  getCollectionState(nameOrScheme: string): CollectionState | undefined {
    const key = normalizeName(nameOrScheme);
    return this.collections.get(key) ?? this.collections.get(this.schemeMap.get(key) ?? '');
  }

  /** @internal */
  getAllCollectionStates(): CollectionState[] {
    return [...this.collections.values()];
  }

  /** @internal */
  getUriAlias(uri: string): string | undefined {
    return this.uriAliases.get(uri);
  }

  /** @internal */
  getProviders(): ReadonlyMap<string, IconRenderProvider> {
    return this.providers;
  }

  /** @internal Creates and caches a definition for an open collection. */
  materialize(state: CollectionState, name: string): IconDefinition | undefined {
    const existing = state.definitions.get(name);
    if (existing || !state.resolveIcon) return existing;
    const input = state.resolveIcon(name);
    if (!input) return undefined;
    // Not a change listeners need to hear about: the icon was always drawable.
    return this.addDefinition(state, { ...input, name }, {});
  }

  /** @internal Starts loading a lazy collection. */
  loadCollection(state: CollectionState): Promise<void> {
    if (state.loaded) return Promise.resolve();
    if (!state.loading && state.load) {
      state.loading = state.load().then(
        (data) => { this.fill(state, data); },
        (error: unknown) => { this.warn(`load:${state.name}`, `${PREFIX} Icon collection "${state.name}" failed to load.`, error); },
      ).finally(() => { state.loaded = true; state.loading = undefined; this.changed(); });
    }
    return state.loading ?? Promise.resolve();
  }

  /** @internal Starts loading an asset through its provider. */
  loadAsset(provider: IconRenderProvider, definition: IconDefinition): void {
    provider.load?.(definition).then(
      () => this.changed(),
      (error: unknown) => { this.warn(`asset:${definition.uri}`, `${PREFIX} Icon ${definition.uri} failed to load.`, error); this.changed(); },
    );
  }

  /** @internal */
  getFallbackId(): string | null {
    return this.fallback;
  }

  /** @internal Logs a development warning once per key. */
  warn(key: string, message: string, detail?: unknown): void {
    if (!this.warnings || this.warned.has(key) || !isDevelopment()) return;
    this.warned.add(key);
    if (detail === undefined) console.warn(message);
    else console.warn(message, detail);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private async loadMetadata(state: CollectionState): Promise<void> {
    if (!state.loadMetadata) return;
    state.metadataLoading ??= state.loadMetadata().then((meta) => {
      for (const [name, extra] of Object.entries(meta)) {
        const def = state.definitions.get(normalizeName(name));
        if (def) state.definitions.set(def.name, freeze({ ...def, metadata: freeze({ ...extra, ...def.metadata, keywords: [...(def.metadata.keywords ?? []), ...(extra.keywords ?? [])] }) }));
      }
      state.loadMetadata = undefined;
      this.changed();
    });
    await state.metadataLoading;
  }

  private fill(state: CollectionState, data: Pick<IconCollectionRegistration, 'icons' | 'aliases'>): void {
    for (const icon of data.icons ?? []) this.addDefinition(state, icon, { override: true });
    for (const [alias, target] of Object.entries(data.aliases ?? {})) {
      const a = normalizeName(alias);
      const t = normalizeName(target);
      state.aliases.set(a, t);
      const def = state.definitions.get(t);
      if (def && !def.aliases.includes(a)) state.definitions.set(t, freeze({ ...def, aliases: freeze([...def.aliases, a]) }));
    }
  }

  private addDefinition(state: CollectionState, icon: Omit<IconRegistration, 'collection'>, options: RegisterOptions): IconDefinition {
    const name = normalizeName(icon.name);
    if (!name || name.includes('://')) throw new Error(`${PREFIX} Invalid icon name "${icon.name}".`);
    if (state.definitions.has(name) && !options.override) throw new Error(`${PREFIX} Icon "${toUri(state.name, name)}" is already registered. Pass { override: true } to replace it.`);
    const provider = icon.provider ?? state.provider;
    const aliases = (icon.aliases ?? []).map(normalizeName);
    const metadata: IconMetadata = { ...icon.metadata };
    const definition: IconDefinition = freeze({
      collection: state.name,
      name,
      uri: toUri(state.name, name),
      provider,
      source: freeze(toSource(provider, icon.source)),
      aliases: freeze(aliases),
      metadata: freeze(metadata),
    });
    state.definitions.set(name, definition);
    for (const alias of aliases) state.aliases.set(alias, name);
    if (metadata.codePoint !== undefined && !state.codePoints.has(metadata.codePoint)) state.codePoints.set(metadata.codePoint, name);
    return definition;
  }

  /** Finds the collection and name of a registered icon (not an alias). */
  private locate(id: string): { state: CollectionState; name: string } | undefined {
    const parsed = parseIconId(id);
    if (!parsed || parsed.kind !== 'name') return undefined;
    const state = this.getCollectionState(parsed.collection ?? this.defaultCollection);
    return state?.definitions.has(parsed.name) ? { state, name: parsed.name } : undefined;
  }

  private toUriKey(id: string): string | undefined {
    const parsed = parseIconId(id);
    if (!parsed || parsed.kind !== 'name') return undefined;
    const collection = parsed.collection ? (this.schemeMap.get(parsed.collection) ?? parsed.collection) : this.defaultCollection;
    return toUri(collection, parsed.name);
  }

  private changed(): this {
    this.version++;
    this.resolver.clearCache();
    for (const listener of [...this.listeners]) listener();
    return this;
  }
}

// Bundlers replace `process.env.NODE_ENV` at build time; declared here so the library needs no Node types.
declare const process: { env: { NODE_ENV?: string } } | undefined;

/** True unless the app is built for production (`process.env.NODE_ENV === 'production'`). */
function isDevelopment(): boolean {
  try {
    // Bundlers turn this into `"production" !== "production"` for production builds. Without a
    // bundler (no `process`), it throws and we treat the build as development.
    return process!.env.NODE_ENV !== 'production';
  } catch {
    return true;
  }
}
