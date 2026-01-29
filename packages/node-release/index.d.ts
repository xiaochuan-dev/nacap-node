declare module '@xiaochuan-dev/nacap-windows-node' {

  export interface Dev {
    name: string;
    description: string;
  }

  export interface CaptureParams {
    length: number;
    data: Buffer;
  }

  export class Sniffer {
    curDevname?: string;
    constructor(devname?: string);
    static getAllDevs(): Dev[];
    isRunning(): boolean;
    setCurDevname(newname: string): void;
    startCapture(fn: (p: CaptureParams) => void): void;
    stopCapture(): void;
  }
}