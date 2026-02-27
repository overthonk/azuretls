interface FfiResponse {
  status_code: number;
  body: string | null;
  body_len: number;
  headers: string | null;
  url: string | null;
  error: string | null;
  protocol: string | null;
}

export default class AzureTLSResponse {
  body: string | null = null;
  headers: Map<string, string | string[]>;
  ok: boolean;
  status: number;
  url: string;
  protocol: string;

  constructor(response: FfiResponse) {
    this.status = response.status_code;
    this.headers = this.parseHeaders(response.headers);
    this.url = response.url ?? '';
    this.protocol = response.protocol ?? '';
    this.ok = response.status_code >= 200 && response.status_code <= 299;

    if (response.body && response.body_len > 0) {
      this.body = response.body;
    }
  }

  text(): string {
    if (!this.body) return '';
    return this.decodeBase64ToUtf8(this.body);
  }

  json(): any | null {
    const text = this.text();
    if (!text) return null;
    return JSON.parse(text);
  }

  arrayBuffer(): ArrayBuffer {
    if (!this.body) return new ArrayBuffer(0);
    const bytes = this.decodeBase64ToBytes(this.body);
    return bytes.buffer;
  }

  blob(): Blob {
    if (!this.body) return new Blob();
    return new Blob([this.decodeBase64ToBytes(this.body)]);
  }

  bytes(): Uint8Array {
    if (!this.body) return new Uint8Array(0);
    return this.decodeBase64ToBytes(this.body);
  }

  private decodeBase64ToUtf8(b64: string): string {
    return Buffer.from(b64, 'base64').toString('utf8');
  }

  private decodeBase64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
    const buffer = Buffer.from(b64, 'base64');
    const bytes = new Uint8Array(buffer.byteLength);
    bytes.set(buffer);
    return bytes as Uint8Array<ArrayBuffer>;
  }

  private parseHeaders(headersB64: string | null): Map<string, string | string[]> {
    if (!headersB64) return new Map();
    const decoded = this.decodeBase64ToUtf8(headersB64);
    if (!decoded) return new Map();

    const parsed: Record<string, string[]> = JSON.parse(decoded);
    return new Map(
      Object.entries(parsed).map(([name, values]) => [
        name.toLowerCase(),
        values.length == 1 ? values[0] : values,
      ])
    );
  }
}
