/**
 * 获取数字的二进制表示字符串，保留指定位数
 * @param num - 要处理的数字
 * @param keepBits - 要保留的位数（从最低位开始）
 * @returns 二进制字符串
 */
export function getBinaryString(num: number, keepBits: number): string {
  // 保留低 keepBits 位
  const masked = num & ((1 << keepBits) - 1);
  return masked.toString(2).padStart(keepBits, '0');
}

