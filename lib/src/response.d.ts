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
    body: string | null;
    headers: Headers;
    ok: boolean;
    status: number;
    url: string;
    protocol: string;
    constructor(response: FfiResponse);
    text(): string;
    json(): any | null;
    arrayBuffer(): ArrayBuffer;
    blob(): Blob;
    bytes(): Uint8Array;
    private decodeBase64ToUtf8;
    private decodeBase64ToBytes;
    private parseHeaders;
}
export {};
