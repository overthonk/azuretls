import * as koffi from 'koffi';
import { getLibraryPath } from '../scripts/postinstall.js';
import AzureTLSResponse from './response.js';

const CFfiResponse = koffi.struct('CFfiResponse', {
  status_code: 'int',
  body: 'char *',
  body_len: 'int',
  headers: 'char *',
  url: 'char *',
  error: 'char *'
});

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

class AzureTLSSession {
  private lib: koffi.IKoffiLib;
  private sessionId: bigint | null = null;

  private azuretls_init: () => void;
  private azuretls_cleanup: () => void;
  private azuretls_session_new: (config: string | null) => bigint;
  private azuretls_session_close: (sessionId: bigint) => void;
  private azuretls_session_do: (sessionId: bigint, request: string) => any;
  private azuretls_session_apply_ja3: (sessionId: bigint, ja3: string, navigator: string) => string | null;
  private azuretls_session_apply_http2: (sessionId: bigint, fingerprint: string) => string | null;
  private azuretls_session_apply_http3: (sessionId: bigint, fingerprint: string) => string | null;
  private azuretls_session_set_proxy: (sessionId: bigint, proxy: string) => string | null;
  private azuretls_session_clear_proxy: (sessionId: bigint) => void;
  private azuretls_session_add_pins: (sessionId: bigint, url: string, pins: string) => string | null;
  private azuretls_session_clear_pins: (sessionId: bigint, url: string) => string | null;
  private azuretls_session_get_ip: (sessionId: bigint) => string | null;
  private azuretls_version: () => string;
  private azuretls_free_string: (str: string | null) => void;
  private azuretls_free_response: (response: any) => void;

  constructor(config: SessionConfig | null = null) {
    this.lib = this._loadLibrary();

    this.azuretls_init = this.lib.func('azuretls_init', 'void', []);
    this.azuretls_cleanup = this.lib.func('azuretls_cleanup', 'void', []);
    this.azuretls_session_new = this.lib.func('azuretls_session_new', 'uint64', ['str']);
    this.azuretls_session_close = this.lib.func('azuretls_session_close', 'void', ['uint64']);
    this.azuretls_session_do = this.lib.func('azuretls_session_do', koffi.pointer(CFfiResponse), ['uint64', 'str']);
    this.azuretls_session_apply_ja3 = this.lib.func('azuretls_session_apply_ja3', 'str', ['uint64', 'str', 'str']);
    this.azuretls_session_apply_http2 = this.lib.func('azuretls_session_apply_http2', 'str', ['uint64', 'str']);
    this.azuretls_session_apply_http3 = this.lib.func('azuretls_session_apply_http3', 'str', ['uint64', 'str']);
    this.azuretls_session_set_proxy = this.lib.func('azuretls_session_set_proxy', 'str', ['uint64', 'str']);
    this.azuretls_session_clear_proxy = this.lib.func('azuretls_session_clear_proxy', 'void', ['uint64']);
    this.azuretls_session_add_pins = this.lib.func('azuretls_session_add_pins', 'str', ['uint64', 'str', 'str']);
    this.azuretls_session_clear_pins = this.lib.func('azuretls_session_clear_pins', 'str', ['uint64', 'str']);
    this.azuretls_session_get_ip = this.lib.func('azuretls_session_get_ip', 'str', ['uint64']);
    this.azuretls_version = this.lib.func('azuretls_version', 'str', []);
    this.azuretls_free_string = this.lib.func('azuretls_free_string', 'void', ['str']);
    this.azuretls_free_response = this.lib.func('azuretls_free_response', 'void', [koffi.pointer(CFfiResponse)]);

    this.azuretls_init();

    // create session
    const configJson = config ? JSON.stringify(config) : null;
    this.sessionId = this.azuretls_session_new(configJson);

    if (this.sessionId === 0n) {
      throw new Error('Failed to create AzureTLS session');
    }
  }

  private _loadLibrary(): koffi.IKoffiLib {
    const libPath = getLibraryPath()

    let lib: koffi.IKoffiLib | null = null;

    try {
      lib = koffi.load(libPath);
    } catch (error) {
      throw new Error(`Could not load AzureTLS library. ${error}`);
    }

    return lib;
  }

  async do(options: RequestOptions): Promise<AzureTLSResponse> {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    const {
      method,
      url,
      body,
      bodyB64,
      headers,
      orderedHeaders,
      timeoutMs,
      forceHttp1 = false,
      forceHttp3 = false,
      ignoreBody = false,
      noCookie = false,
      disableRedirects = false,
      maxRedirects,
      insecureSkipVerify = false
    } = options;

    const requestData: any = {
      method,
      url,
      resp_body_b64: true
    };

    if (body !== undefined) requestData.body = body;
    if (bodyB64 !== undefined) requestData.body_b64 = bodyB64;
    if (headers !== undefined) requestData.headers = headers;
    if (orderedHeaders !== undefined) requestData.ordered_headers = orderedHeaders;
    if (timeoutMs !== undefined) requestData.timeout_ms = timeoutMs;
    if (forceHttp1) requestData.force_http1 = true;
    if (forceHttp3) requestData.force_http3 = true;
    if (ignoreBody) requestData.ignore_body = true;
    if (noCookie) requestData.no_cookie = true;
    if (disableRedirects) requestData.disable_redirects = true;
    if (maxRedirects !== undefined) requestData.max_redirects = maxRedirects;
    if (insecureSkipVerify) requestData.insecure_skip_verify = true;

    const requestJson = JSON.stringify(requestData);
    const responsePtr = this.azuretls_session_do(this.sessionId, requestJson);

    if (!responsePtr) {
      throw new Error('Failed to execute request');
    }

    try {
      const response = koffi.decode(responsePtr, CFfiResponse);
      if (response.error) {
        throw new Error(response.error)
      }

      return new AzureTLSResponse(response);
    } finally {
      this.azuretls_free_response(responsePtr);
    }
  }

  async get(url: string, options: Omit<RequestOptions, 'method' | 'url'> = {}): Promise<AzureTLSResponse> {
    return this.do({ method: 'GET', url, ...options });
  }

  async post(url: string, options: Omit<RequestOptions, 'method' | 'url'> = {}): Promise<AzureTLSResponse> {
    return this.do({ method: 'POST', url, ...options });
  }

  async put(url: string, options: Omit<RequestOptions, 'method' | 'url'> = {}): Promise<AzureTLSResponse> {
    return this.do({ method: 'PUT', url, ...options });
  }

  async delete(url: string, options: Omit<RequestOptions, 'method' | 'url'> = {}): Promise<AzureTLSResponse> {
    return this.do({ method: 'DELETE', url, ...options });
  }

  async head(url: string, options: Omit<RequestOptions, 'method' | 'url'> = {}): Promise<AzureTLSResponse> {
    return this.do({ method: 'HEAD', url, ignoreBody: true, ...options });
  }

  async options(url: string, options: Omit<RequestOptions, 'method' | 'url'> = {}): Promise<AzureTLSResponse> {
    return this.do({ method: 'OPTIONS', url, ...options });
  }

  async patch(url: string, options: Omit<RequestOptions, 'method' | 'url'> = {}): Promise<AzureTLSResponse> {
    return this.do({ method: 'PATCH', url, ...options });
  }

  applyJa3(ja3: string, navigator: string = 'chrome'): void {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    const error = this.azuretls_session_apply_ja3(this.sessionId, ja3, navigator);
    if (error) {
      throw new Error(`Failed to apply JA3: ${error}`);
    }
  }

  applyHttp2(fingerprint: string): void {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    const error = this.azuretls_session_apply_http2(this.sessionId, fingerprint);
    if (error) {
      throw new Error(`Failed to apply HTTP/2 fingerprint: ${error}`);
    }
  }

  applyHttp3(fingerprint: string): void {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    const error = this.azuretls_session_apply_http3(this.sessionId, fingerprint);
    if (error) {
      throw new Error(`Failed to apply HTTP/3 fingerprint: ${error}`);
    }
  }

  setProxy(proxy: string): void {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    const error = this.azuretls_session_set_proxy(this.sessionId, proxy);
    if (error) {
      throw new Error(`Failed to set proxy: ${error}`);
    }
  }

  clearProxy(): void {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    this.azuretls_session_clear_proxy(this.sessionId);
  }

  addPins(url: string, pins: string[]): void {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    const pinsJson = JSON.stringify(pins);
    const error = this.azuretls_session_add_pins(this.sessionId, url, pinsJson);
    if (error) {
      throw new Error(`Failed to add pins: ${error}`);
    }
  }

  clearPins(url: string): void {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    const error = this.azuretls_session_clear_pins(this.sessionId, url);
    if (error) {
      throw new Error(`Failed to clear pins: ${error}`);
    }
  }

  async getIp(): Promise<string> {
    if (!this.sessionId) {
      throw new Error('Session is closed');
    }

    const result = this.azuretls_session_get_ip(this.sessionId);
    if (!result) {
      throw new Error('Failed to get IP address');
    }

    if (result.startsWith('error:')) {
      throw new Error(result);
    }

    return result;
  }

  getVersion(): string {
    return this.azuretls_version() || 'unknown';
  }

  close(): void {
    if (this.sessionId && this.sessionId !== 0n) {
      this.azuretls_session_close(this.sessionId);
      this.azuretls_cleanup()
      this.sessionId = null;
    }
  }
}

export { AzureTLSSession };
export type { SessionConfig, RequestOptions }