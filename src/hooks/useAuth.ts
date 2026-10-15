import { useState } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { AuthMode, AuthResponse, User } from '../types';

const API_ROOT = 'http://127.0.0.1:8000/api';
type ApiRequestOptions = RequestInit;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isUser(value: unknown): value is User {
    return isRecord(value)
        && (typeof value.id === 'number' || typeof value.id === 'string')
        && typeof value.email === 'string'
        && (value.name === undefined || typeof value.name === 'string');
}

function isAuthResponse(value: unknown): value is AuthResponse {
    return isRecord(value) && typeof value.token === 'string' && isUser(value.user);
}

function getApiErrorMessage(payload: unknown): string | undefined {
    if (!isRecord(payload)) {
        return undefined;
    }

    if (isRecord(payload.errors)) {
        for (const value of Object.values(payload.errors)) {
            if (typeof value === 'string') {
                return value;
            }

            if (Array.isArray(value)) {
                const message = value.find((item): item is string => typeof item === 'string');
                if (message) {
                    return message;
                }
            }
        }
    }

    return typeof payload.message === 'string' ? payload.message : undefined;
}

function hasApiErrors(payload: unknown): boolean {
    return isRecord(payload) && Boolean(payload.errors);
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function readSavedUser(): User | null {
    try {
        const savedUser: unknown = JSON.parse(sessionStorage.getItem('apiUser') || 'null');
        return isUser(savedUser) ? savedUser : null;
    } catch {
        return null;
    }
}

export default function useAuth(setError: Dispatch<SetStateAction<string>>) {
    const [token, setToken] = useState(() => sessionStorage.getItem('apiToken') || '');
    const [user, setUser] = useState<User | null>(readSavedUser);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    async function apiRequest(url: string, options: ApiRequestOptions = {}): Promise<unknown> {
        const headers = new Headers({
            Accept: 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        });
        new Headers(options.headers).forEach((value, key) => headers.set(key, value));

        const response = await fetch(url, { ...options, headers });
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem('apiToken');
                sessionStorage.removeItem('apiUser');
                setToken('');
                setUser(null);
            }

            throw new Error(getApiErrorMessage(payload) || `Request failed (${response.status}).`);
        }

        return payload;
    }

    async function authenticate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoggingIn(true);
        setError('');
        const isRegistration = authMode === 'register';

        try {
            const response = await fetch(`${API_ROOT}/${isRegistration ? 'register' : 'login'}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...(isRegistration ? { name, password_confirmation: password } : {}),
                    email,
                    password
                })
            });
            const payload: unknown = await response.json().catch(() => null);

            if (!response.ok || hasApiErrors(payload) || !isAuthResponse(payload)) {
                const validationError = getApiErrorMessage(payload);
                const action = isRegistration ? 'Registration' : 'Sign in';
                throw new Error(
                    validationError || `${action} failed (${response.status}).`
                );
            }

            sessionStorage.setItem('apiToken', payload.token);
            sessionStorage.setItem('apiUser', JSON.stringify(payload.user));
            setToken(payload.token);
            setUser(payload.user);
            setPassword('');
            setError('');
        } catch (error) {
            const action = isRegistration ? 'create account' : 'sign in';
            setError(`Couldn't ${action}. ${getErrorMessage(error)}`);
        } finally {
            setIsLoggingIn(false);
        }
    }

    async function signOut(onSignedOut: () => void) {
        setError('');

        try {
            await apiRequest(`${API_ROOT}/logout`, { method: 'POST' });
        } catch (error) {
            setError(`Couldn't sign out from the API. ${getErrorMessage(error)}`);
        } finally {
            sessionStorage.removeItem('apiToken');
            sessionStorage.removeItem('apiUser');
            setToken('');
            setUser(null);
            onSignedOut();
        }
    }

    function toggleAuthMode() {
        setAuthMode(currentMode => currentMode === 'register' ? 'login' : 'register');
        setError('');
    }

    return {
        apiRequest,
        authenticate,
        authMode,
        email,
        isLoggingIn,
        name,
        password,
        setEmail,
        setName,
        setPassword,
        signOut,
        toggleAuthMode,
        user
    };
}
