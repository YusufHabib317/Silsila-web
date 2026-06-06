'use client';

import { listContacts } from '@/lib/api/contacts';
import { listOrders } from '@/lib/api/orders';
import { listProducts } from '@/lib/api/products';

import {
  buildCommissionContactOptions,
  buildCommissionOrderOptions,
  buildCommissionProductOptions,
  type CommissionFormOptions,
} from './commission-options';

export async function listCommissionFormOptions(): Promise<CommissionFormOptions> {
  const [contacts, orders, products] = await Promise.all([
    listContacts({ limit: 100 }),
    listOrders({ limit: 100 }),
    listProducts({ limit: 100 }),
  ]);

  return {
    contactOptions: buildCommissionContactOptions(contacts),
    orderOptions: buildCommissionOrderOptions(orders),
    productOptions: buildCommissionProductOptions(products),
  };
}
