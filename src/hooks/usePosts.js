import { useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/posts';

function unwrapPosts(payload) {
    const result = payload && Object.prototype.hasOwnProperty.call(payload, 'data')
        ? payload.data
        : payload;

    return Array.isArray(result) ? result : [];
}

export default function usePosts(apiRequest, setError) {
    const [posts, setPosts] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeButton, setActiveButton] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [draft, setDraft] = useState({ title: '', body: '' });

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

    function resetPostFormForSignOut() {
        setIsFormOpen(false);
        setEditingPost(null);
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
