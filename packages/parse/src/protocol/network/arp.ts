export namespace ARP {
  export enum HardwareType {
    Eth = 1
  }

  export enum ARPProtocolType {
    IPV4 = 0x0800
  }

  export function parseARPProtocolType(protocolType: ARPProtocolType) {
    return ARPProtocolType[protocolType];
  }

  export function parseHardwareType(hardwareType: HardwareType) {
    return HardwareType[hardwareType];
  }

  export enum Operation {
    Request = 1,
    Reply = 2,
  }

  export function parseOprationStr(operation: Operation) {
    return Operation[operation];
  }

  export interface ARP {
    _type: 'arp';
    /**
     * 2 bytes
     */
    hardwareType: HardwareType;
    hardwareTypeStr: string;
    /**
     * 2 bytes
     */
    protocolType: ARPProtocolType;
    protocolTypeStr: string;
    /**
     * 1byte
     */
    hardwareLength: number;
    /**
     * 1byte
     */
    protocolLength: number;
    /**
     * 2bytes
     */
    operation: number;

    /**
     * 长度上面的字段指定
     */
    senderHardwareAddr?: string;
    senderProtocolAddr?: string;
    targetHardwareAddr?: string;
    targetProtocolAddr?: string;
  }
}