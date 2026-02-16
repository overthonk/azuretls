export default class AzureTLSResponse {
    constructor(response) {
        this.body = null;
        this.status = response.status_code;
        this.headers = this.parseHeaders(response.headers);
        this.url = response.url ?? '';
        this.protocol = response.protocol ?? '';
        this.ok = response.status_code >= 200 && response.status_code <= 299;
        if (response.body && response.body_len > 0) {
            this.body = response.body;
        }
    }
    text() {
        if (!this.body)
            return '';
        return this.decodeBase64ToUtf8(this.body);
    }
    json() {
        const text = this.text();
        if (!text)
            return null;
        return JSON.parse(text);
    }
    arrayBuffer() {
        if (!this.body)
            return new ArrayBuffer(0);
        const bytes = this.decodeBase64ToBytes(this.body);
        return bytes.buffer;
    }
    blob() {
        if (!this.body)
            return new Blob();
        return new Blob([this.decodeBase64ToBytes(this.body)]);
    }
    bytes() {
        if (!this.body)
            return new Uint8Array(0);
        return this.decodeBase64ToBytes(this.body);
    }
    decodeBase64ToUtf8(b64) {
        return Buffer.from(b64, 'base64').toString('utf8');
    }
    decodeBase64ToBytes(b64) {
        const buffer = Buffer.from(b64, 'base64');
        const bytes = new Uint8Array(buffer.byteLength);
        bytes.set(buffer);
        return bytes;
    }
    parseHeaders(headersB64) {
        if (!headersB64)
            return new Headers();
        const decoded = this.decodeBase64ToUtf8(headersB64);
        if (!decoded)
            return new Headers();
        return new Headers(JSON.parse(decoded));
    }
}
//# sourceMappingURL=response.js.map