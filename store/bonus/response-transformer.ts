import { z } from 'zod';

export const bonusRuleTypeSchema = z.enum(['percentage', 'fixed']);
export const bonusGatewaySchema = z.enum(['ccpayment', 'kazawallet']);

export const bonusRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  type: bonusRuleTypeSchema,
  gateway: bonusGatewaySchema.optional(),
  value: z.coerce.number(),
  minTopUp: z.coerce.number().nullable(),
  maxTopUp: z.coerce.number().nullable(),
  maxBonus: z.coerce.number().nullable(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  status: z.string().optional(),
});

export const bonusRulesApiResponseSchema = z
  .object({
    success: z.boolean().optional(),
    code: z.number().optional(),
    message: z.string().optional(),
    meta: z.unknown().optional(),
    data: z.array(bonusRuleSchema),
    errors: z.unknown().nullable().optional(),
  })
  .transform(({ data }) => data);
