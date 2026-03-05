import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://naboah-pulse-api-production.up.railway.app'

async function getHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession()
    return {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
    }
}

export async function apiGet<T = any>(path: string): Promise<T> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}${path}`, { headers })
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
    return res.json()
}

export async function apiPost<T = any>(path: string, body: unknown): Promise<T> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
    return res.json()
}

export async function apiPut<T = any>(path: string, body: unknown): Promise<T> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}${path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
    return res.json()
}

export async function apiPatch<T = any>(path: string, body: unknown): Promise<T> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}${path}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
    return res.json()
}

export async function apiDelete<T = any>(path: string): Promise<T> {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers })
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
    return res.json()
}
