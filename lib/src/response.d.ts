export default class AzureTLSResponse {
    body: string | null;
    headers: Headers;
    ok: boolean;
    status: number;
    url: string;
    constructor(response: any);
    text(): string;
    json(): any | null;
    arrayBuffer(): ArrayBuffer;
    blob(): Blob;
    bytes(): Uint8Array;
}
