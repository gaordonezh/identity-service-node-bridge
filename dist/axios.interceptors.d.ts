import axios, { InternalAxiosRequestConfig } from "axios";
interface GetAccessTokenRequestBody {
    identityServiceHost: string;
    clientId: string;
    accessCode: string;
}
export declare function axiosRequestInterceptor(config: InternalAxiosRequestConfig<any>, body: GetAccessTokenRequestBody): Promise<axios.InternalAxiosRequestConfig<any>>;
export declare function axiosResponseInterceptor(error: any): Promise<never>;
export {};
