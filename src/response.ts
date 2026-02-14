export default class AzureTLSResponse {
  body: string | null = null;
  headers: Headers;
  ok: boolean;
  status: number;
  url: string;

  constructor(response: any) {
    this.status = response.status_code
    this.headers = new Headers(JSON.parse(response.headers))
    this.url = response.url,
    this.ok = response.status_code >= 200 && response.status_code <= 299

    if (response.body && response.body_len > 0) {
      this.body = response.body
    }
  }

  text(): string {
    if (!this.body) return '';
    return atob(this.body);
  }

  json(): any | null {
    const text = this.text();
    if (!text) return null;
    return JSON.parse(text);
  }

  arrayBuffer(): ArrayBuffer {
    if (!this.body) return new ArrayBuffer(0);
    return Uint8Array.from(atob(this.body), c => c.charCodeAt(0)).buffer;
  }

  blob(): Blob {
    if (!this.body) return new Blob();
    return new Blob([Uint8Array.from(atob(this.body), c => c.charCodeAt(0))]);
  }

  bytes(): Uint8Array {
    if (!this.body) return new Uint8Array(0);
    return Uint8Array.from(atob(this.body), c => c.charCodeAt(0));
  }
}