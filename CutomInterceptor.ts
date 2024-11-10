import { ApiResponse, FetchInterceptor } from "@/types/api";
// import { getToken } from "@/actions/auth/cookie.action";

async function createInterceptor(): Promise<FetchInterceptor> {
  // RETRIEVING TOKENS FROM COOKIES
  //   const tokens = await getToken();

  const interceptors: FetchInterceptor = {
    request: {
      use: (handler) => {
        interceptors.request.handler = handler;
      },
      handler: (request) => {
        // Modify request headers, add authorization token, etc.
        const headers = new Headers(request.init?.headers);

        // Append access token and access IV to headers
        // tokens.accessTokenData &&
        //   headers.append("x-access-token", tokens.accessTokenData as string);
        // tokens.accessTokenIv &&
        //   headers.append("x-access-iv", tokens.accessTokenIv as string);

        // tokens.refreshTokenData &&
        //   headers.append("x-refresh-token", tokens.refreshTokenData as string);
        // tokens.refreshTokenIv &&
        //   headers.append("x-refresh-iv", tokens.refreshTokenIv as string);

        // headers.append("ngrok-skip-browser-warning", "69420");

        return { ...request, init: { ...request.init, headers } };
      },
    },
    response: {
      use: (handler) => {
        interceptors.response.handler = handler;
      },
      handler: (response) => response,
    },
  };

  return interceptors;
}

async function enhancedFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<any> {
  const interceptor = await createInterceptor(); // Wait for interceptor creation
  const modifiedRequest = interceptor.request.handler({ input, init });
  const response = await fetch(modifiedRequest.input, modifiedRequest.init);
  return interceptor.response.handler(response);
}

//////////////////////////
/* CUSTOM FETCH METHODS */
//////////////////////////

export async function getMethod<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return enhancedFetch(url, { ...options, method: "GET" }).then((r) =>
    r.json(),
  );
}

export async function postMethod<T>(
  url: string,
  data?: any,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return enhancedFetch(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  }).then((r) => r.json());
}

export async function putMethod<T>(
  url: string,
  data?: any,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return enhancedFetch(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  }).then((r) => r.json());
}

export async function patchMethod<T>(
  url: string,
  data?: any,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return enhancedFetch(url, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  }).then((r) => r.json());
}

export async function deleteMethod<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  return enhancedFetch(url, { ...options, method: "DELETE" }).then((r) =>
    r.json(),
  );
}

export async function getSwrMethod<T>(url: string): Promise<ApiResponse<T>> {
  return await fetch(url).then((r) => r.json());
}
