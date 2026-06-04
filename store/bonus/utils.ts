import type { BonusRule } from './types';

function isRuleActive(rule: BonusRule, now: number): boolean {
  if (rule.status !== undefined) return rule.status === '1';
  if (rule.startsAt && new Date(rule.startsAt).getTime() > now) return false;
  if (rule.endsAt && new Date(rule.endsAt).getTime() < now) return false;
  return true;
}

export function getActiveBonusRules(rules: BonusRule[]): BonusRule[] {
  const now = Date.now();
  return rules.filter((r) => isRuleActive(r, now));
}

function computeRuleBonus(rule: BonusRule, amount: number): number {
  if (rule.minTopUp !== null && amount < rule.minTopUp) return 0;
  if (rule.maxTopUp !== null && amount > rule.maxTopUp) return 0;
  const raw =
    rule.type === 'percentage' ? (amount * rule.value) / 100 : rule.value;
  if (raw <= 0) return 0;
  return rule.maxBonus !== null ? Math.min(raw, rule.maxBonus) : raw;
}

export function getBestBonusRule(
  rules: BonusRule[],
  amount: number,
): { rule: BonusRule; bonus: number } | null {
  if (!amount || amount <= 0) return null;
  let best: { rule: BonusRule; bonus: number } | null = null;
  for (const rule of rules) {
    const bonus = computeRuleBonus(rule, amount);
    if (bonus > 0 && (!best || bonus > best.bonus)) {
      best = { rule, bonus };
    }
  }
  return best;
}

export function computeBonusForAmount(
  rules: BonusRule[],
  amount: number,
): number {
  return getBestBonusRule(rules, amount)?.bonus ?? 0;
}
