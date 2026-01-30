
export const enum IPv4Protocol {
  ICMP = 1,
  IGMP = 2,
  TCP = 6,
  UDP = 17
}

export const IPv4ProtocolMap = {
  [IPv4Protocol.ICMP]: 'ICMP',
  [IPv4Protocol.IGMP]: 'IGMP',
  [IPv4Protocol.TCP]: 'TCP',
  [IPv4Protocol.UDP]: 'UDP'
}

export function parseIPv4Protocol(protocol: IPv4Protocol): string {
  switch (protocol) {
    case IPv4Protocol.ICMP:
    case IPv4Protocol.IGMP:
    case IPv4Protocol.TCP:
    case IPv4Protocol.UDP:
      return IPv4ProtocolMap[protocol];
  
    default:
      return 'Unkown';
  }
}

export interface IPv4 {
  _type: 'ipv4';
  /**
   * 版本 4bit, 固定为4
   */
  version: 4;
  /**
   * 首部长度,单位4字节，这个值最小为5，也就是首部最小20字节(无附加选项)
   */
  headerLength: number;
  headerLengthByte: number;
  /**
   * 1字节
   */
  TOS: number;

  /**
   * 总长度 2字节，单位字节
   */
  allLength: number;
  /**
   * 标识，2字节,区分同一原始数据报，分片时使用
   */
  identification: number;
  /**
   * 标志，3bit，分别是保留位,DF,MF,
   */
  flags: number;
  df: boolean;
  mf: boolean;
  /**
   * 片偏移，13bit， 单位8字节，分片在原始数据包中的位置
   */
  fragmentOffset: number;
  fragmentOffsetByte: number;


  /**
   * 1字节
   */
  TTL: number;
  /**
   * 上层协议,1字节
   */
  protocol: IPv4Protocol;
  protocolStr: string;
  /**
   * 首部校验和，2字节，只检测首部
   */
  checksum: number;

  /**
   * 源地址，4byte
   */
  srcIpAddr: string;
  /**
   * 目的地址，4byte
   */
  dstIpAddr: string;
  /**
   * 选项，必须是4字节的整数倍，没有达到进行填充，大部分数据包没有这个
   */
  optionsHex?: string;

}