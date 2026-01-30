import { Eth, EtherType, parseTypeLength } from './protocol/eth';
import { IPv4, parseIPv4Protocol } from './protocol/network';

export class Parse {

  offset: number = 0;

  public constructor(public data: Buffer, public length: number) {
    
  }

  public startParse() {
    const layers = [];

    const layer1 = this.parseEth();
    layers.push(layer1);

    let layer2 = null;
    switch (layer1.typeLengthNum) {
      case EtherType.IPV4:
        layer2 = this.parseIPV4();
        break;
    
      default:

        break;
    }
    layers.push(layer2);

    return layers;
  }

  private parseIPV4(): IPv4 {
    const { data } = this;
    const b1 = data.readUInt8(this.offset);
    this.offset += 1;
    const headerLength = (b1 & 0x0f);
    const headerLengthByte = headerLength * 4;
    const TOS = data.readUint8(this.offset);
    this.offset += 1;
    const allLength = data.readUInt16BE(this.offset);
    this.offset += 2;
    const identification = data.readUint16BE(this.offset);
    this.offset += 2;

    const word1 = data.readUint16BE(this.offset);
    this.offset += 2;
    const flags = (word1 & 0b1110000000000000) >>> 13;

    const df = ((flags & 0b010) >>> 1) === 1;
    const mf = (flags & 0b001) === 1; 

    const fragmentOffset = word1 & 0b0001111111111111;
    const fragmentOffsetByte = fragmentOffset * 8;
    const TTL = data.readUint8(this.offset);
    this.offset += 1;

    const protocol = data.readUint8(this.offset);
    this.offset += 1;
    const protocolStr = parseIPv4Protocol(protocol);
    const checksum = data.readUint16BE(this.offset);
    this.offset += 2;

    const { srcIpAddr, dstIpAddr } = this.parseIp();

    if (headerLengthByte !== 20) {
      const optionsLength = headerLengthByte - 20;
      this.offset += optionsLength;
    }

    return {
      _type: 'ipv4',
      version: 4,
      headerLength,
      headerLengthByte,
      TOS,
      allLength,
      identification,
      flags,
      df,
      mf,
      fragmentOffset,
      fragmentOffsetByte,
      TTL,
      protocol,
      protocolStr,
      checksum,
      srcIpAddr,
      dstIpAddr
    };

  }

  private parseIp() {
    const { data } = this;
    const srcIp1 = data.readUint8(this.offset);
    this.offset += 1;
    const srcIp2 = data.readUint8(this.offset);
    this.offset += 1;
    const srcIp3 = data.readUint8(this.offset);
    this.offset += 1;
    const srcIp4 = data.readUint8(this.offset);
    this.offset += 1;
    
    const srcIpAddr = `${srcIp1}.${srcIp2}.${srcIp3}.${srcIp4}`;

    const dstIp1 = data.readUint8(this.offset);
    this.offset += 1;
    const dstIp2 = data.readUint8(this.offset);
    this.offset += 1;
    const dstIp3 = data.readUint8(this.offset);
    this.offset += 1;
    const dstIp4 = data.readUint8(this.offset);
    this.offset += 1;

    const dstIpAddr = `${dstIp1}.${dstIp2}.${dstIp3}.${dstIp4}`;

    return {
      srcIpAddr,
      dstIpAddr,
    };
  }


  private parseEth(): Eth {
    const { dstMac, srcMac }  = this.parseMac();
    
    const typeLengthNum = this.data.readUInt16BE(this.offset);
    const typeLengthHex = this.data.subarray(this.offset, this.offset + 2).toString('hex');
    this.offset += 2;

    if (typeLengthNum == EtherType.VlanTEth) {
      // 带vlan的以太网帧
      return null;
    } else {
      const typeLength = parseTypeLength(typeLengthNum);
      return {
        _type: 'eth',
        srcMac,
        dstMac,
        typeLengthNum,
        typeLength,
        typeLengthHex,
      };
    }
  }

  private formatMac(str: string) {
    return Array.from(str).reduce((acc, char, index) => {
    if (index % 2 === 0) {
      acc.push(str.slice(index, index + 2));
    }
    return acc;
  }, []).join('-');

  }

  private parseMac() {
    const { data } = this;
    const dstMac = data.subarray(this.offset, this.offset + 6).toString('hex');
    this.offset += 6;
    const srcMac = data.subarray(this.offset, this.offset + 6).toString('hex');
    this.offset += 6;

    return {
      dstMac: this.formatMac(dstMac),
      srcMac: this.formatMac(srcMac)
    };
  }
}
