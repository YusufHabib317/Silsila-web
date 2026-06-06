'use client';

import { listContacts } from '@/lib/api/contacts';
import { listProducts } from '@/lib/api/products';

import {
  buildOrderContactOptions,
  buildOrderProductOptions,
  type OrderFormOptions,
} from './order-options';

export async function listOrderFormOptions(): Promise<OrderFormOptions> {
  const [customers, merchants, agents, products] = await Promise.all([
    listContacts({ limit: 100, role: 'customer' }),
    listContacts({ limit: 100, role: 'merchant' }),
    listContacts({ limit: 100, role: 'agent' }),
    listProducts({ limit: 100 }),
  ]);

  return {
    agentContactOptions: buildOrderContactOptions(agents),
    customerContactOptions: buildOrderContactOptions(customers),
    merchantContactOptions: buildOrderContactOptions(merchants),
    productOptions: buildOrderProductOptions(products),
  };
}
