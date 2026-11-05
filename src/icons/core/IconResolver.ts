import { parseIconId, toUri } from './identifier';
import type { IconRegistry } from './IconRegistry';
import type { IconDefinition, IconRenderProvider, IconResolution } from './types';

export interface ResolveOptions {
  /** Collection for plain names. @default the registry's default collection */
  collection?: string;
  /** Use the registry's fallback icon for unknown identifiers. @default true */
  fallback?: boolean;
  /** Log the development warning for unknown identifiers. @default true */
  warn?: boolean;
  /** Report `pending` until the provider's asset (for example an SVG URL) has loaded. @default true */
  assets?: boolean;
}

const MAX_ALIAS_DEPTH = 8;

/**
 * Turns an identifier into a definition and provider: parse → collection (or scheme) → aliases →
 * definition → provider. Results are cached until the registry changes, so icons rendered
 * thousands of times are parsed and looked up once.
 */
export class IconResolver {
  private cache = new Map<string, IconResolution>();

  constructor(private readonly registry: IconRegistry) {}

  clearCache(): void {
    this.cache.clear();
  }

  resolve(id: string | number, options: ResolveOptions = {}): IconResolution {
    const useFallback = options.fallback ?? true;
    const key = `${options.collection ?? ''}|${useFallback ? 1 : 0}|${options.assets === false ? 0 : 1}|${String(id)}`;
    const cached = this.cache.get(key);
    if (cached) return cached;
    const result = this.resolveUncached(id, options, useFallback);
    // Pending results are not cached: the next render must check again.
    if (result.status !== 'pending') this.cache.set(key, result);
    return result;
  }

  private resolveUncached(id: string | number, options: ResolveOptions, useFallback: boolean): IconResolution {
    const requested = String(id);
    const assets = options.assets ?? true;
    const found = this.lookup(id, options.collection, assets);
    if (found.status !== 'missing') return found;
    if (options.warn ?? true) this.registry.warn(`unknown:${found.requested}`, `[ENTERPRISE-UI] Unknown icon: ${found.requested} (${found.reason})`);
    const fallback = useFallback ? this.registry.getFallbackId() : null;
    if (fallback && fallback !== requested) {
      const viaFallback = this.lookup(fallback, undefined, assets);
      if (viaFallback.status !== 'missing') return { ...viaFallback, requested };
    }
    return found;
  }

  /** Resolution without fallback. */
  private lookup(id: string | number, collectionOption: string | undefined, assets: boolean): IconResolution {
    const parsed = parseIconId(id);
    if (!parsed) return { status: 'missing', requested: String(id), reason: 'empty identifier' };

    if (parsed.kind === 'codePoint') {
      const label = `U+${parsed.codePoint.toString(16).toUpperCase()}`;
      let pending = false;
      for (const state of this.registry.getAllCollectionStates()) {
        if (!state.loaded) { pending = true; void this.registry.loadCollection(state); continue; }
        const name = state.codePoints.get(parsed.codePoint);
        if (name) return this.withProvider(state.definitions.get(name)!, label, assets);
      }
      return pending ? { status: 'pending', requested: label } : { status: 'missing', requested: label, reason: 'no icon has this code point' };
    }

    let collection = parsed.collection ?? collectionOption ?? this.registry.getDefaultCollection();
    let name = parsed.name;
    for (let depth = 0; depth <= MAX_ALIAS_DEPTH; depth++) {
      const state = this.registry.getCollectionState(collection);
      const requested = toUri(state?.name ?? collection, name);
      if (!state) return { status: 'missing', requested, reason: `unknown collection "${collection}"` };
      if (!state.loaded) { void this.registry.loadCollection(state); return { status: 'pending', requested }; }
      // Cross-collection alias registered with registerAlias, then aliases inside the collection.
      const uriAlias = this.registry.getUriAlias(toUri(state.name, name));
      if (uriAlias) {
        const next = parseIconId(uriAlias);
        if (next?.kind !== 'name') return { status: 'missing', requested, reason: `invalid alias target "${uriAlias}"` };
        collection = next.collection ?? this.registry.getDefaultCollection();
        name = next.name;
        continue;
      }
      const target = state.aliases.get(name);
      if (target && target !== name && !state.definitions.has(name)) { name = target; continue; }
      const definition = state.definitions.get(name) ?? this.registry.materialize(state, name);
      if (!definition) return { status: 'missing', requested, reason: `no icon "${name}" in collection "${state.name}"` };
      return this.withProvider(definition, toUri(parsed.collection ?? collection, parsed.name), assets);
    }
    return { status: 'missing', requested: String(id), reason: 'alias loop' };
  }

  private withProvider(definition: IconDefinition, requested: string, assets: boolean): IconResolution {
    const providers = this.registry.getProviders();
    let provider: IconRenderProvider | undefined = providers.get(definition.provider);
    if (!provider?.canRender(definition)) provider = [...providers.values()].find((p) => p.canRender(definition));
    if (!provider) return { status: 'missing', requested, reason: `no provider can draw it (provider "${definition.provider}")` };
    if (assets && provider.isReady && !provider.isReady(definition)) {
      this.registry.loadAsset(provider, definition);
      return { status: 'pending', requested };
    }
    return { status: 'resolved', definition, provider, requested };
  }
}

