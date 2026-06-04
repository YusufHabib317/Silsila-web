import type { z } from 'zod';

import type {
  bonusRuleSchema,
  bonusRuleTypeSchema,
} from './response-transformer';

export type BonusRuleType = z.infer<typeof bonusRuleTypeSchema>;
export type BonusRule = z.infer<typeof bonusRuleSchema>;
export type BonusRulesApiResponse = BonusRule[];
export type BonusGateway = 'ccpayment' | 'kazawallet';
