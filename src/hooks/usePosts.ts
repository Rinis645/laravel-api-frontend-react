import { useState } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { Id, Post, PostDraft } from '../types';

const API_URL = 'http://127.0.0.1:8000/api/posts';
type ApiRequest = (url: string, options?: RequestInit) => Promise<unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isPost(value: unknown): value is Post {
    if (!isRecord(value)) {
        return false;
    }

    return (typeof value.id === 'number' || typeof value.id === 'string')
        && (value.user_id == null || typeof value.user_id === 'number' || typeof value.user_id === 'string')
        && (value.title == null || typeof value.title === 'string')
        && (value.body == null || typeof value.body === 'string');
}

function unwrapPosts(payload: unknown): Post[] {
    const result = isRecord(payload) && Object.prototype.hasOwnProperty.call(payload, 'data')
        ? payload.data
        : payload;

    if (!Array.isArray(result) || !result.every(isPost)) {
        throw new Error('The API returned an invalid posts response.');
    }

    return result;
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export default function usePosts(
    apiRequest: ApiRequest,
    setError: Dispatch<SetStateAction<string>>
) {
    const [posts, setPosts] = useState<Post[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeButton, setActiveButton] = useState<'fetch' | 'xhr' | ''>('');
    const [isSaving, setIsSaving] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState<Id | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [draft, setDraft] = useState<PostDraft>({ title: '', body: '' });

    async function loadWithFetch() {
        setIsLoading(true);
        setActiveButton('fetch');
        setError('');
        setPosts(null);

        try {
            const payload = await apiRequest(API_URL);
            setPosts(unwrapPosts(payload));
        } catch (error) {
            setError(`Couldn't load posts. ${getErrorMessage(error)}`);
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
                const payload: unknown = request.responseText ? JSON.parse(request.responseText) : null;

                if (request.status < 200 || request.status >= 300) {
                    const message = isRecord(payload) && typeof payload.message === 'string'
                        ? payload.message
                        : `Request failed (${request.status}).`;
                    throw new Error(message);
                }

                setPosts(unwrapPosts(payload));
            } catch (error) {
                setError(`Couldn't load posts. ${getErrorMessage(error)}`);
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

    function openNewPostForm() {
        setEditingPost(null);
        setDraft({ title: '', body: '' });
        setIsFormOpen(true);
        setError('');
    }

    function openEditPostForm(post: Post) {
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

    function resetPostFormForSignOut() {
        setIsFormOpen(false);
        setEditingPost(null);
    }

    async function savePost(event: FormEvent<HTMLFormElement>) {
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
            setError(`Couldn't save post. ${getErrorMessage(error)}`);
        } finally {
            setIsSaving(false);
        }
    }

    async function deletePost(post: Post) {
        if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) {
            return;
        }

        setDeletingPostId(post.id);
        setError('');

        try {
            await apiRequest(`${API_URL}/${post.id}`, { method: 'DELETE' });
            setPosts(currentPosts => currentPosts?.filter(item => item.id !== post.id) ?? null);
        } catch (error) {
            setError(`Couldn't delete post. ${getErrorMessage(error)}`);
        } finally {
            setDeletingPostId(null);
        }
    }

    return {
        activeButton,
        closePostForm,
        deletePost,
        deletingPostId,
        draft,
        editingPost,
        isFormOpen,
        isLoading,
        isSaving,
        loadWithFetch,
        loadWithXmlHttpRequest,
        openEditPostForm,
        openNewPostForm,
        posts,
        resetPostFormForSignOut,
        savePost,
        setDraft
    };
}
