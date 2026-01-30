export const enum EtherType {
  // ==================== 长度字段范围 (IEEE 802.3) ====================
  /** 最小有效长度值 */
  MIN_LENGTH = 0x0000,
  /** 最大有效长度值 (1500 十进制) */
  MAX_LENGTH = 0x05DC,
  
  // ==================== 协议类型 (以太网II) ====================
  // ---------- 最核心的网络层协议 ----------
  /** IPv4 协议 - 最常用 */
  IPV4 = 0x0800,
  /** IPv6 协议 */
  IPV6 = 0x86DD,
  /** 地址解析协议 */
  ARP = 0x0806,
  /**
   * 带vlan头的
   */
  VlanTEth = 0x8100,

  /** 环路协议 */
  LOOPBACK = 0x9000,
}

const EtherTypeMap = {
  [EtherType.ARP]: 'ARP',
  [EtherType.IPV6]: 'IPV6',
  [EtherType.IPV4]: 'IPV4',
  [EtherType.LOOPBACK]: 'LOOPBACK',
}

export function parseTypeLength(num: number): string {

  if (num >= EtherType.MIN_LENGTH && num <= EtherType.MAX_LENGTH) {
    return 'Length';
  }

  switch (num) {
    case EtherType.IPV4:
    case EtherType.ARP:
    case EtherType.IPV6:
    case EtherType.LOOPBACK:
      return EtherTypeMap[num];
    default:
      return 'UnKown';
  }
}

export interface Eth {
  _type: 'eth';
  /**
   * 目标mac地址
   */
  dstMac: string;
  /**
   * 源mac地址
   */
  srcMac: string;
  /**
   * 上层协议类型或者payload长度，原始字节
   */
  typeLengthNum: number;
  /**
   * 上层协议类型或者payload长度 
   */
  typeLength: string;
  /**
   * 上层协议类型或者payload长度
   */
  typeLengthHex: string | null;
}

export interface EthWithVlan extends Omit<Eth, '_type'> {
  _type: 'eth-wlan';
  /**
   * 标签控制信息,2字节
   */
  TCI: number;
  /**
   * 标签控制信息,2字节
   */
  TCIHEX: string;

}

export function parseTCI(tciBytes: number): {
  priority: number;    // 优先级 0-7
  dei: number;        // DEI/CFI标志
  vlanId: number;      // VLAN ID 0-4095
} {
  const tci = tciBytes & 0xFFFF;
  
  return {
    priority: (tci >> 13) & 0x07,
    dei: ((tci >> 12) & 0x01),
    vlanId: tci & 0x0FFF,
  };
}
