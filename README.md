# azuretls

A TypeScript/Node.js wrapper for AzureTLS's C FFI with an API closely matching undici's fetch.

## Installation
```bash
npm install azuretls
```

The native library will be automatically downloaded during installation for your platform (Windows, macOS, Linux) and architecture (amd64, arm64). The native library is downloaded from [azuretls-client](https://github.com/overthonk/azuretls-client).

## Simple usage 

```typescript
import { AzureTLSSession } from 'azuretls';

const session = new AzureTLSSession();

const response = await session.get('https://example.com');
console.log(response.statusCode);
console.log(response.text()); // .json(), .arrayBuffer(), .blob() and .bytes() are also offered

session.close();
```
## API Reference

### `AzureTLSSession`

#### Constructor
```typescript
new AzureTLSSession(config?: SessionConfig)
```

**SessionConfig:**
- `browser?: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ios'`
- `user_agent?: string`
- `proxy?: string`
- `timeout_ms?: number`
- `max_redirects?: number`
- `insecure_skip_verify?: boolean`
- `ordered_headers?: [string, string][]`
- `headers?: Record<string, string>`

#### Methods

**HTTP Methods:**
- `get(url: string, options?: RequestOptions): Promise<AzureTLSResponse>`
- `post(url: string, options?: RequestOptions): Promise<AzureTLSResponse>`
- `put(url: string, options?: RequestOptions): Promise<AzureTLSResponse>`
- `delete(url: string, options?: RequestOptions): Promise<AzureTLSResponse>`
- `head(url: string, options?: RequestOptions): Promise<AzureTLSResponse>`
- `options(url: string, options?: RequestOptions): Promise<AzureTLSResponse>`
- `patch(url: string, options?: RequestOptions): Promise<AzureTLSResponse>`

**Fingerprinting:**
- `applyJa3(ja3: string, navigator?: string): void`
- `applyHttp2(fingerprint: string): void`
- `applyHttp3(fingerprint: string): void`

**Proxy:**
- `setProxy(proxy: string): void`
- `clearProxy(): void`

**Certificate Pinning:**
- `addPins(url: string, pins: string[]): void`
- `clearPins(url: string): void`

**Utilities:**
- `getIp(): Promise<string>`
- `getVersion(): string`
- `close(): void`

## License

The majority of code was taken from [the example Typescript usage for azuretls-client](https://github.com/Noooste/azuretls-client/tree/main/cffi/examples) and made to work with `koffi`. 

MIT