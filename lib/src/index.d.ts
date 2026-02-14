import AzureTLSResponse from './response.js';
interface SessionConfig {
    browser?: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ios';
    user_agent?: string;
    proxy?: string;
    timeout_ms?: number;
    max_redirects?: number;
    insecure_skip_verify?: boolean;
    ordered_headers?: [string, string][];
    headers?: Record<string, string>;
}
interface RequestOptions {
    method: string;
    url: string;
    body?: string;
    bodyB64?: string;
    headers?: Record<string, string>;
    orderedHeaders?: [string, string][];
    timeoutMs?: number;
    forceHttp1?: boolean;
    forceHttp3?: boolean;
    ignoreBody?: boolean;
    noCookie?: boolean;
    disableRedirects?: boolean;
    maxRedirects?: number;
    insecureSkipVerify?: boolean;
}
declare class AzureTLSSession {
    private lib;
    private sessionId;
    private azuretls_init;
    private azuretls_cleanup;
    private azuretls_session_new;
    private azuretls_session_close;
    private azuretls_session_do;
    private azuretls_session_apply_ja3;
    private azuretls_session_apply_http2;
    private azuretls_session_apply_http3;
    private azuretls_session_set_proxy;
    private azuretls_session_clear_proxy;
    private azuretls_session_add_pins;
    private azuretls_session_clear_pins;
    private azuretls_session_get_ip;
    private azuretls_version;
    private azuretls_free_string;
    private azuretls_free_response;
    constructor(config?: SessionConfig | null);
    private _loadLibrary;
    do(options: RequestOptions): Promise<AzureTLSResponse>;
    get(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<AzureTLSResponse>;
    post(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<AzureTLSResponse>;
    put(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<AzureTLSResponse>;
    delete(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<AzureTLSResponse>;
    head(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<AzureTLSResponse>;
    options(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<AzureTLSResponse>;
    patch(url: string, options?: Omit<RequestOptions, 'method' | 'url'>): Promise<AzureTLSResponse>;
    applyJa3(ja3: string, navigator?: string): void;
    applyHttp2(fingerprint: string): void;
    applyHttp3(fingerprint: string): void;
    setProxy(proxy: string): void;
    clearProxy(): void;
    addPins(url: string, pins: string[]): void;
    clearPins(url: string): void;
    getIp(): Promise<string>;
    getVersion(): string;
    close(): void;
}
export { AzureTLSSession };
export type { SessionConfig, RequestOptions };
