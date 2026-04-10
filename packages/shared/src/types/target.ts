export interface ParsedTarget {
  raw: string;
  hostname: string;
  port?: number;
  protocol: string;
  url: string;
  isIP: boolean;
}
