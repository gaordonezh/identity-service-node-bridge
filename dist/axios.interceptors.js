"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosRequestInterceptor = axiosRequestInterceptor;
exports.axiosResponseInterceptor = axiosResponseInterceptor;
const axios_1 = __importDefault(require("axios"));
const cached = {
    token: "",
    expires: 0,
    promise: null,
};
async function getAccessToken({ accessCode, clientId, identityServiceHost, origin }) {
    const now = Date.now();
    if (cached.token && cached.expires && now < cached.expires) {
        return cached.token;
    }
    if (cached.promise) {
        return cached.promise;
    }
    cached.promise = axios_1.default
        .post(identityServiceHost + "/auth/client-credentials", {
        client_id: clientId,
        clientAccessToken: accessCode,
    }, {
        headers: {
            "x-origin": origin,
        },
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
async function axiosRequestInterceptor(config, body) {
    const token = await getAccessToken(body);
    config.headers.Authorization = `Bearer ${token}`;
    return config;
}
async function axiosResponseInterceptor(error) {
    if (error.response?.status === 401) {
        cached.token = "";
        cached.expires = 0;
    }
    return Promise.reject(error);
}
