import { apiGet, handleApiError, retryUnlessUnauthorized } from '@/utils';
import { apiEndpoints } from '@/data';

import { bonusRulesApiResponseSchema } from './response-transformer';
import type { BonusGateway, BonusRulesApiResponse } from './types';

enum queryKeys {
  bonusRules = 'bonusRules',
}

const getBonusRulesRequest = (
  gateway: BonusGateway,
): Promise<BonusRulesApiResponse> =>
  apiGet(apiEndpoints.clientBonus(), bonusRulesApiResponseSchema, {
    params: { gateway },
  }).catch((e) => {
    handleApiError(e, true);
    throw e.response?.data ?? e;
  });

export const getBonusRulesQuery = (gateway: BonusGateway) => ({
  queryKey: [queryKeys.bonusRules, gateway] as const,
  queryFn: () => getBonusRulesRequest(gateway),
  refetchOnWindowFocus: false,
  retry: retryUnlessUnauthorized,
});
