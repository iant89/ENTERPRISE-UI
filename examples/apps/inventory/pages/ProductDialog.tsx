import { useEffect, useState, type FormEvent } from 'react';
import { AmountInput, Button, Dialog, Form, FormErrorSummary, Input, NumberInput, Select, type FormErrorSummaryItem } from '@enterprise-ui/react';
import { categoryOptions, supplierOptions, type Product } from '../../../data';

export type ProductDraft = Omit<Product, 'id' | 'status' | 'updated'>;

interface Values {
  name: string;
  sku: string;
  category: string | null;
  supplier: string | null;
  stock: number | null;
  price: number | null;
}

const blank: Values = { name: '', sku: '', category: null, supplier: null, stock: 0, price: null };

/** Validates the product form; returns one entry per invalid field. */
export function validateProduct(v: Values, existingSkus: string[]): FormErrorSummaryItem[] {
  const errors: FormErrorSummaryItem[] = [];
  if (!v.name.trim()) errors.push({ id: 'product-name', label: 'Product name', message: 'Enter a product name.' });
  if (!v.sku.trim()) errors.push({ id: 'product-sku', label: 'SKU', message: 'Enter a SKU.' });
  else if (!/^SKU-[0-9A-Z-]{3,}$/i.test(v.sku.trim())) errors.push({ id: 'product-sku', label: 'SKU', message: 'Use the format SKU-000000.' });
  else if (existingSkus.includes(v.sku.trim().toUpperCase())) errors.push({ id: 'product-sku', label: 'SKU', message: 'This SKU is already in use.' });
  if (!v.category) errors.push({ id: 'product-category', label: 'Category', message: 'Choose a category.' });
  if (!v.supplier) errors.push({ id: 'product-supplier', label: 'Supplier', message: 'Choose a supplier.' });
  if (v.stock == null || v.stock < 0) errors.push({ id: 'product-stock', label: 'Stock', message: 'Enter a stock level of 0 or more.' });
  if (v.price == null || v.price <= 0) errors.push({ id: 'product-price', label: 'Price', message: 'Enter a price above 0.' });
  return errors;
}

export interface ProductDialogProps {
  open: boolean;
  /** Edit an existing product; omit to create one. */
  product?: Product | null;
  existingSkus: string[];
  onClose: () => void;
  onSubmit: (draft: ProductDraft) => void;
}

/** Create or edit a product, with inline and summary validation. */
export function ProductDialog({ open, product, existingSkus, onClose, onSubmit }: ProductDialogProps) {
  const [values, setValues] = useState<Values>(blank);
  const [errors, setErrors] = useState<FormErrorSummaryItem[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    setValues(product ? { name: product.name, sku: product.sku, category: product.category, supplier: product.supplier, stock: product.stock, price: product.price } : blank);
    setErrors([]);
    setAttempt(0);
  }, [open, product]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));
  const errorFor = (id: string) => errors.find((e) => e.id === id)?.message;
  const skus = existingSkus.filter((s) => s !== product?.sku.toUpperCase());

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = validateProduct(values, skus);
    setErrors(next);
    setAttempt((a) => a + 1);
    if (next.length) return;
    onSubmit({
      name: values.name.trim(), sku: values.sku.trim().toUpperCase(), category: values.category!, supplier: values.supplier!, stock: values.stock!, price: values.price!,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={product ? `Edit ${product.name}` : 'Create product'}
      size="md"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="product-form">{product ? 'Save changes' : 'Create'}</Button>
        </>
      }
    >
      <Form id="product-form" noValidate onSubmit={submit} aria-label={product ? 'Edit product' : 'Create product'}>
        {errors.length > 0 && <FormErrorSummary errors={errors} focusKey={attempt} />}
        <Input id="product-name" label="Product name" required value={values.name} onChange={(e) => set('name', e.target.value)} error={errorFor('product-name')} />
        <Input id="product-sku" label="SKU" required placeholder="SKU-000000" value={values.sku} onChange={(e) => set('sku', e.target.value)} error={errorFor('product-sku')} />
        <Select id="product-category" label="Category" required placeholder="Choose a category" options={categoryOptions} value={values.category} onChange={(v) => set('category', v)} error={errorFor('product-category')} />
        <Select id="product-supplier" label="Supplier" required placeholder="Choose a supplier" options={supplierOptions} value={values.supplier} onChange={(v) => set('supplier', v)} error={errorFor('product-supplier')} />
        <NumberInput id="product-stock" label="Stock" required min={0} value={values.stock} onChange={(v) => set('stock', v)} error={errorFor('product-stock')} />
        <AmountInput id="product-price" label="Price" required currency="USD" min={0} value={values.price} onChange={(v) => set('price', v)} error={errorFor('product-price')} />
      </Form>
    </Dialog>
  );
}
