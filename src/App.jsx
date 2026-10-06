import React, { useState } from 'react';

const API_ROOT = 'http://127.0.0.1:8000/api';
const API_URL = `${API_ROOT}/posts`;

function unwrapPosts(payload) {
    const result = payload && Object.prototype.hasOwnProperty.call(payload, 'data')
        ? payload.data
        : payload;

    return Array.isArray(result) ? result : [];
}

function readSavedUser() {
    try {
        return JSON.parse(sessionStorage.getItem('apiUser') || 'null');
    } catch {
        return null;
    }
}

export default function App() {
    const [posts, setPosts] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeButton, setActiveButton] = useState('');
    const [token, setToken] = useState(() => sessionStorage.getItem('apiToken') || '');
    const [user, setUser] = useState(readSavedUser);
    const [authMode, setAuthMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [draft, setDraft] = useState({ title: '', body: '' });

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

    async function loadWithFetch() {
        setIsLoading(true);
        setActiveButton('fetch');
        setError('');
        setPosts(null);

        try {
            const payload = await apiRequest(API_URL);
            setPosts(unwrapPosts(payload));
        } catch (error) {
            setError(`Couldn't load posts. ${error.message}`);
        } finally {
            setIsLoading(false);
            setActiveButton('');
        }
    }

    function loadWithXmlHttpRequest() {
        setIsLoading(true);
        setActiveButton('xhr');
        setError('');
        setPosts(null);

        const request = new XMLHttpRequest();
        request.open('GET', API_URL);
        request.setRequestHeader('Accept', 'application/json');

        request.onload = () => {
            try {
                const payload = request.responseText ? JSON.parse(request.responseText) : null;

                if (request.status < 200 || request.status >= 300) {
                    throw new Error(payload?.message || `Request failed (${request.status}).`);
                }

                setPosts(unwrapPosts(payload));
            } catch (error) {
                setError(`Couldn't load posts. ${error.message}`);
            } finally {
                setIsLoading(false);
                setActiveButton('');
            }
        };

        request.onerror = () => {
            setError("Couldn't load posts. Network error. Check that the API is running.");
            setIsLoading(false);
            setActiveButton('');
        };

        request.send();
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

    async function signOut() {
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
            setIsFormOpen(false);
            setEditingPost(null);
        }
    }

    function openNewPostForm() {
        setEditingPost(null);
        setDraft({ title: '', body: '' });
        setIsFormOpen(true);
        setError('');
    }

    function openEditPostForm(post) {
        setEditingPost(post);
        setDraft({ title: post.title || '', body: post.body || '' });
        setIsFormOpen(true);
        setError('');
    }

    function closePostForm() {
        setIsFormOpen(false);
        setEditingPost(null);
        setDraft({ title: '', body: '' });
    }

    async function savePost(event) {
        event.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            await apiRequest(editingPost ? `${API_URL}/${editingPost.id}` : API_URL, {
                method: editingPost ? 'PUT' : 'POST',
                body: JSON.stringify(draft)
            });
            const payload = await apiRequest(API_URL);
            setPosts(unwrapPosts(payload));
            closePostForm();
        } catch (error) {
            setError(`Couldn't save post. ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    }

    async function deletePost(post) {
        if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) {
            return;
        }

        setDeletingPostId(post.id);
        setError('');

        try {
            await apiRequest(`${API_URL}/${post.id}`, { method: 'DELETE' });
            setPosts(currentPosts => currentPosts.filter(item => item.id !== post.id));
        } catch (error) {
            setError(`Couldn't delete post. ${error.message}`);
        } finally {
            setDeletingPostId(null);
        }
    }

    return (
        <main>
            <h1>Posts</h1>

            {user ? (
                <div className="account-bar">
                    <span>Signed in as {user.email}</span>
                    <button className="secondary-button" type="button" onClick={signOut}>Sign out</button>
                </div>
            ) : (
                <form className={`login-form ${authMode === 'register' ? 'register-form' : ''}`} onSubmit={authenticate}>
                    <h2>{authMode === 'register' ? 'Create an account' : 'Sign in to manage posts'}</h2>
                    {authMode === 'register' && (
                        <label>
                            Name
                            <input
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={event => setName(event.target.value)}
                                required
                            />
                        </label>
                    )}
                    <label>
                        Email
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            required
                        />
                    </label>
                    <button className="primary-button" type="submit" disabled={isLoggingIn}>
                        {isLoggingIn
                            ? (authMode === 'register' ? 'Creating account...' : 'Signing in...')
                            : (authMode === 'register' ? 'Create account' : 'Sign in')}
                    </button>
                    <button
                        className="text-button auth-mode-button"
                        type="button"
                        onClick={() => {
                            setAuthMode(authMode === 'register' ? 'login' : 'register');
                            setError('');
                        }}
                    >
                        {authMode === 'register' ? 'Already have an account? Sign in' : 'Create an account'}
                    </button>
                </form>
            )}

            <button id="loadPosts" type="button" onClick={loadWithFetch} disabled={isLoading}>
                {activeButton === 'fetch' ? 'Loading...' : 'Load posts'}
            </button>
            <button id="loadPostsXHR" type="button" onClick={loadWithXmlHttpRequest} disabled={isLoading}>
                {activeButton === 'xhr' ? 'Loading...' : 'Load posts (XMLHttpRequest)'}
            </button>

            <div className="loading-indicator" role="status" aria-live="polite" hidden={!isLoading}>
                <span className="loading-spinner" aria-hidden="true" />
                <span>Loading posts...</span>
            </div>

            {user && (
                <div className="post-toolbar">
                    <button className="primary-button" type="button" onClick={openNewPostForm}>
                        New post
                    </button>
                </div>
            )}

            {isFormOpen && (
                <form className="post-form" onSubmit={savePost}>
                    <h2>{editingPost ? 'Edit post' : 'New post'}</h2>
                    <label>
                        Title
                        <input
                            type="text"
                            maxLength="255"
                            value={draft.title}
                            onChange={event => setDraft({ ...draft, title: event.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Body
                        <textarea
                            rows="5"
                            value={draft.body}
                            onChange={event => setDraft({ ...draft, body: event.target.value })}
                            required
                        />
                    </label>
                    <div className="form-actions">
                        <button className="primary-button" type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save post'}
                        </button>
                        <button className="secondary-button" type="button" onClick={closePostForm} disabled={isSaving}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div id="posts" aria-live="polite" aria-busy={isLoading || isSaving}>
                {error && <p className="error-message" role="alert">{error}</p>}
                {posts?.length === 0 && <p className="empty-message">No posts to show yet.</p>}
                {posts?.map(post => {
                    const canManagePost = user && String(post.user_id) === String(user.id);

                    return (
                        <article className="post-card" key={post.id}>
                            <h2>{post.title || 'Untitled post'}</h2>
                            <p>{post.body || ''}</p>
                            {canManagePost && (
                                <div className="post-actions">
                                    <button className="text-button" type="button" onClick={() => openEditPostForm(post)}>
                                        Edit
                                    </button>
                                    <button
                                        className="danger-button"
                                        type="button"
                                        onClick={() => deletePost(post)}
                                        disabled={deletingPostId === post.id}
                                    >
                                        {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </main>
    );
}