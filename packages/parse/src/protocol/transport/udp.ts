export namespace UDP {
  export interface Udp {
    _type: 'udp';
    /**
     * 源端口,2bytes
     */
    srcPort: number;
    /**
     * 目的端口,2bytes
     */
    dstPort: number;
    /**
     * udp总长度,2bytes
     */
    udpLength: number;

    /**
     * 校验和
     */
    checksum: number;
  }
}