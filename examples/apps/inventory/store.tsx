import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Density, ThemePreference } from '@enterprise-ui/react';
import type { Product, ProductStatus } from '../../data';
import { initialNotifications, initialProducts, MOVEMENTS_SEEN_BEFORE, stockMovements, type AppNotification, type PageId } from './data';

/** Filters the Products page reads; other pages set them to deep-link into the catalog. */
export interface ProductFilters {
  query: string;
  categories: string[];
  supplier: string | null;
  status: ProductStatus | null;
}

export const emptyFilters: ProductFilters = { query: '', categories: [], supplier: null, status: null };

export interface InventoryStore {
  page: PageId;
  navigate: (page: PageId) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'status' | 'updated'>) => Product;
  updateProducts: (ids: string[], patch: Partial<Product>) => void;
  removeProducts: (ids: string[]) => void;
  duplicateProduct: (id: string) => Product | undefined;
  filters: ProductFilters;
  setFilters: (next: Partial<ProductFilters>) => void;
  /** Navigate to Products with exactly these filters. */
  showProducts: (filters: Partial<ProductFilters>) => void;
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadMovements: number;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  density: Density;
  setDensity: (density: Density) => void;
}

const Ctx = createContext<InventoryStore | null>(null);

export function useInventory(): InventoryStore {
  const store = useContext(Ctx);
  if (!store) throw new Error('useInventory must be used inside <InventoryProvider>.');
  return store;
}

export const statusForStock = (stock: number, current?: ProductStatus): ProductStatus =>
  current === 'Discontinued' ? 'Discontinued' : stock === 0 ? 'Out of stock' : stock < 15 ? 'Low stock' : 'In stock';

const today = () => new Date().toISOString().slice(0, 10);

export interface InventoryProviderProps {
  page: PageId;
  navigate: (page: PageId) => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  density: Density;
  setDensity: (density: Density) => void;
  children: ReactNode;
}

/** Shared, in-memory app state for every inventory page. */
export function InventoryProvider({ page, navigate, theme, setTheme, density, setDensity, children }: InventoryProviderProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filters, setFilterState] = useState<ProductFilters>(emptyFilters);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [movementsSeen, setMovementsSeen] = useState(page === 'stock');
  const [nextId, setNextId] = useState(1001 + initialProducts.length);

  const go = useCallback(
    (next: PageId) => {
      if (next === 'stock') setMovementsSeen(true);
      navigate(next);
    },
    [navigate],
  );

  const addProduct = useCallback<InventoryStore['addProduct']>(
    (input) => {
      const product: Product = { ...input, id: `P-${nextId}`, status: statusForStock(input.stock), updated: today() };
      setNextId((n) => n + 1);
      setProducts((list) => [product, ...list]);
      return product;
    },
    [nextId],
  );

  const updateProducts = useCallback((ids: string[], patch: Partial<Product>) => {
    setProducts((list) =>
      list.map((p) => {
        if (!ids.includes(p.id)) return p;
        const merged = { ...p, ...patch, updated: today() };
        return patch.status ? merged : { ...merged, status: statusForStock(merged.stock, p.status) };
      }),
    );
  }, []);

  const removeProducts = useCallback((ids: string[]) => setProducts((list) => list.filter((p) => !ids.includes(p.id))), []);

  const duplicateProduct = useCallback(
    (id: string) => {
      const source = products.find((p) => p.id === id);
      if (!source) return undefined;
      const { id: _id, status: _status, updated: _updated, ...rest } = source;
      return addProduct({ ...rest, name: `${source.name} (copy)`, sku: `${source.sku}-C` });
    },
    [products, addProduct],
  );

  const setFilters = useCallback((next: Partial<ProductFilters>) => setFilterState((f) => ({ ...f, ...next })), []);
  const showProducts = useCallback(
    (next: Partial<ProductFilters>) => {
      setFilterState({ ...emptyFilters, ...next });
      go('products');
    },
    [go],
  );

  const markRead = useCallback((id: string) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))), []);
  const markAllRead = useCallback(() => setNotifications((list) => list.map((n) => ({ ...n, read: true }))), []);

  const unreadMovements = movementsSeen ? 0 : stockMovements.filter((m) => m.date >= MOVEMENTS_SEEN_BEFORE).length;

  const value = useMemo<InventoryStore>(
    () => ({
      page, navigate: go, products, addProduct, updateProducts, removeProducts, duplicateProduct, filters, setFilters, showProducts,
      notifications, markRead, markAllRead, unreadMovements, theme, setTheme, density, setDensity,
    }),
    [page, go, products, addProduct, updateProducts, removeProducts, duplicateProduct, filters, setFilters, showProducts, notifications, markRead, markAllRead, unreadMovements, theme, setTheme, density, setDensity],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
