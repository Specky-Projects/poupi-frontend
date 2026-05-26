declare const process: { env?: Record<string, string | undefined> } | undefined;

function resolveBaseUrl(baseUrl?: string) {
  const configured = baseUrl ?? process?.env?.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (process?.env?.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL is required in production");
  }

  return "http://localhost:8000";
}

export type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => string | Promise<string | null | undefined>;
  headers?: HeadersInit;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(private readonly options: ApiClientOptions = {}) {
    this.baseUrl = resolveBaseUrl(options.baseUrl);
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.options.getToken?.();
    const headers = new Headers({
      "Content-Type": "application/json",
      ...this.options.headers,
      ...init.headers,
    });

    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
      throw new ApiClientError(message, response.status, payload);
    }

    return payload as T;
  }

  get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: "GET" });
  }

  post<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: "POST", body: JSON.stringify(body ?? {}) });
  }

  patch<T>(path: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: "PATCH", body: JSON.stringify(body ?? {}) });
  }

  delete<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: "DELETE" });
  }
}

export const dataCoreClient = new ApiClient();
export const createApiClient = (options?: ApiClientOptions) => new ApiClient(options);


