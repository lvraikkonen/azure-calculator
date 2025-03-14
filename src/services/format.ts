import { UserSettings } from './storage';

// 货币符号映射
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€'
};

// 货币汇率映射（以USD为基准）
const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  CNY: 7.15,  // 示例汇率，实际应该从API获取
  EUR: 0.92   // 示例汇率，实际应该从API获取
};

/**
 * 根据用户设置格式化价格
 * @param price 价格（USD）
 * @param userSettings 用户设置
 * @returns 格式化后的价格字符串
 */
export const formatPrice = (price: number, userSettings: UserSettings): string => {
  const { currency = 'USD' } = userSettings;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const rate = CURRENCY_RATES[currency] || 1;
  
  // 转换货币并格式化
  const convertedPrice = price * rate;
  
  return `${symbol}${convertedPrice.toFixed(2)}`;
};

/**
 * 将价格转换为指定货币（不包含符号）
 * @param price 价格（USD）
 * @param currency 目标货币代码
 * @returns 转换后的价格数值
 */
export const convertPrice = (price: number, currency: string = 'USD'): number => {
  const rate = CURRENCY_RATES[currency] || 1;
  return price * rate;
};

/**
 * 获取特定货币的符号
 * @param currency 货币代码
 * @returns 货币符号
 */
export const getCurrencySymbol = (currency: string = 'USD'): string => {
  return CURRENCY_SYMBOLS[currency] || '$';
};