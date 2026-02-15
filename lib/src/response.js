export default class AzureTLSResponse {
    constructor(response) {
        this.body = null;
        this.status = response.status_code;
        this.headers = new Headers(JSON.parse(atob(response.headers)));
        this.url = response.url,
            this.ok = response.status_code >= 200 && response.status_code <= 299;
        if (response.body && response.body_len > 0) {
            this.body = response.body;
        }
    }
    text() {
        if (!this.body)
            return '';
        return atob(this.body);
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
        return Uint8Array.from(atob(this.body), c => c.charCodeAt(0)).buffer;
    }
    blob() {
        if (!this.body)
            return new Blob();
        return new Blob([Uint8Array.from(atob(this.body), c => c.charCodeAt(0))]);
    }
    bytes() {
        if (!this.body)
            return new Uint8Array(0);
        return Uint8Array.from(atob(this.body), c => c.charCodeAt(0));
    }
}
//# sourceMappingURL=response.js.map