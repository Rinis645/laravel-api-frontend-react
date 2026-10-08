import { useState } from 'react';

const API_ROOT = 'http://127.0.0.1:8000/api';

function readSavedUser() {
    try {
        return JSON.parse(sessionStorage.getItem('apiUser') || 'null');
    } catch {
        return null;
    }
}

export default function useAuth(setError) {
    const [token, setToken] = useState(() => sessionStorage.getItem('apiToken') || '');
    const [user, setUser] = useState(readSavedUser);
    const [authMode, setAuthMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                Accept: 'application/json',
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers
            }
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem('apiToken');
                sessionStorage.removeItem('apiUser');
                setToken('');
                setUser(null);
            }

            const validationError = payload?.errors && Object.values(payload.errors).flat()[0];
            throw new Error(validationError || payload?.message || `Request failed (${response.status}).`);
        }

        return payload;
    }

    async function authenticate(event) {
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
            const payload = await response.json().catch(() => null);

            if (!response.ok || payload?.errors || !payload?.token) {
                const validationError = payload?.errors && Object.values(payload.errors).flat()[0];
                const action = isRegistration ? 'Registration' : 'Sign in';
                throw new Error(validationError || payload?.message || `${action} failed (${response.status}).`);
            }

            sessionStorage.setItem('apiToken', payload.token);
            sessionStorage.setItem('apiUser', JSON.stringify(payload.user));
            setToken(payload.token);
            setUser(payload.user);
            setPassword('');
            setError('');
        } catch (error) {
            const action = isRegistration ? 'create account' : 'sign in';
            setError(`Couldn't ${action}. ${error.message}`);
        } finally {
            setIsLoggingIn(false);
        }
    }

    async function signOut(onSignedOut) {
        setError('');

        try {
            await apiRequest(`${API_ROOT}/logout`, { method: 'POST' });
        } catch (error) {
            setError(`Couldn't sign out from the API. ${error.message}`);
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
