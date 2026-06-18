import axios, { InternalAxiosRequestConfig } from "axios";

interface GetAccessTokenRequestBody {
  identityServiceHost: string;
  clientId: string;
  accessCode: string;
}

interface CachedParams {
  token: string;
  expires: number;
  promise: null | Promise<string>;
}

interface CredentialsResponse {
  accessToken: string;
  expiresIn: number;
}

const cached: CachedParams = {
  token: "",
  expires: 0,
  promise: null,
};

async function getAccessToken({ accessCode, clientId, identityServiceHost }: GetAccessTokenRequestBody) {
  const now = Date.now();

  if (cached.token && cached.expires && now < cached.expires) {
    return cached.token;
  }

  if (cached.promise) {
    return cached.promise;
  }

  cached.promise = axios
    .post<CredentialsResponse>(identityServiceHost + "/auth/client-credentials", {
      client_id: clientId,
      clientAccessToken: accessCode,
    })
    .then((res) => {
      cached.token = res.data.accessToken;
      cached.expires = Date.now() + res.data.expiresIn - 10000;
      return cached.token;
    })
    .catch((error) => {
      cached.token = "";
      cached.expires = 0;
      throw error;
    })
    .finally(() => {
      cached.promise = null;
    });

  return cached.promise;
}

export async function axiosRequestInterceptor(config: InternalAxiosRequestConfig<any>, body: GetAccessTokenRequestBody) {
  const token = await getAccessToken(body);
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}

export async function axiosResponseInterceptor(error: any) {
  if (error.response?.status === 401) {
    cached.token = "";
    cached.expires = 0;
  }

  return Promise.reject(error);
}
