import { useLoginStore } from "@/stores/login"
const API_URL = "/api"

let login: ReturnType<typeof useLoginStore> | null = null;
export function getLogin() {
    if (login === null) {
        login = useLoginStore()
    }
    return login
}

type RequestOptions = {
    body?: any,
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    headers?: HeadersInit,
}

/**
 * A wrapper around fetch to get data from the local API.
 * Automatically handles auth and converts body to json.
 */
export async function api_fetch(url: string, options?: RequestOptions) {
    if (!getLogin().token === null) {
        throw new Error("Trying to fetch from api without being logged in")
    }

    const headers = new Headers(options?.headers)
    headers.set('Authorization', `Bearer ${getLogin().token}`)
    if (options?.body !== undefined) {
        headers.set('Content-Type', 'application/json')
    }

    const result = await fetch(API_URL + url, {
        body: JSON.stringify(options?.body),
        method: options?.method ?? 'GET',
        headers: headers,
    })

    if (result.status === 401) {
        await getLogin().setToken(null);
    }
    return result;
}

/**
 * A wrapper around fetch similar to api_fetch, except it does unauthorized requests.
 */
export async function unauth_api_fetch(url: string, options?: RequestOptions) {
    const headers = new Headers(options?.headers)
    if (options?.body !== undefined) {
        headers.set('Content-Type', 'application/json')
    }

    return await fetch(API_URL + url, {
        body: JSON.stringify(options?.body),
        method: options?.method ?? 'GET',
        headers: headers,
    })
}
