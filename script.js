const API_URL = 'http://127.0.0.1:8000/api/posts';
const loadButton = document.querySelector('#loadPosts');
const posts = document.querySelector('#posts');
const xhrButton = document.createElement('button');
xhrButton.id = 'loadPostsXHR';
xhrButton.type = 'button';
xhrButton.textContent = 'Load posts (XMLHttpRequest)';
loadButton.insertAdjacentElement('afterend', xhrButton);

const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.setAttribute('role', 'status');
loadingIndicator.setAttribute('aria-live', 'polite');
loadingIndicator.hidden = true;

const spinner = document.createElement('span');
spinner.className = 'loading-spinner';
spinner.setAttribute('aria-hidden', 'true');
const loadingText = document.createElement('span');
loadingText.textContent = 'Loading posts...';
loadingIndicator.append(spinner, loadingText);
posts.parentNode.insertBefore(loadingIndicator, posts);

const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    #loadPostsXHR {
        min-height: 44px;
        margin: 24px 0 8px 10px;
        padding: 0 18px;
        border: 1px solid #172a24;
        background: transparent;
        color: #172a24;
        font-size: 12px;
        font-weight: 600;
        transition: background .2s ease, transform .2s ease;
    }
    #loadPostsXHR:hover { transform: translateY(-1px); background: #e8ece7; }
    #loadPostsXHR:disabled { cursor: wait; opacity: .65; }
    .loading-indicator { display: flex; align-items: center; gap: 10px; margin: 12px 0; color: #69776f; font-size: 12px; }
    .loading-indicator[hidden] { display: none; }
    .loading-spinner { width: 18px; height: 18px; border: 2px solid #dce3dd; border-top-color: #618436; border-radius: 50%; animation: posts-spinner-spin .75s linear infinite; }
    @keyframes posts-spinner-spin { to { transform: rotate(360deg); } }
    @media (max-width: 650px) {
        #loadPostsXHR { display: block; margin: 10px 0 8px; }
    }
`;
document.head.append(dynamicStyles);

const loadButtons = [loadButton, xhrButton];
const buttonLabels = new Map(loadButtons.map(button => [button, button.textContent]));

function unwrapPosts(payload) {
    const result = payload && Object.prototype.hasOwnProperty.call(payload, 'data')
        ? payload.data
        : payload;
    return Array.isArray(result) ? result : [];
}

function renderPosts(items) {
    posts.replaceChildren();

    if (items.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No posts to show yet.';
        posts.append(emptyMessage);
        return;
    }

    items.forEach(post => {
        const article = document.createElement('article');
        article.className = 'post-card';

        const title = document.createElement('h2');
        title.textContent = post.title || 'Untitled post';
        const body = document.createElement('p');
        body.textContent = post.body || '';

        article.append(title, body);
        posts.append(article);
    });
}

function setLoading(isLoading, activeButton = null) {
    loadButtons.forEach(button => {
        button.disabled = isLoading;
        button.textContent = isLoading && button === activeButton
            ? 'Loading...'
            : buttonLabels.get(button);
    });
    loadingIndicator.hidden = !isLoading;
    posts.setAttribute('aria-busy', String(isLoading));
}

function renderError(error) {
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.textContent = `Couldn't load posts. ${error.message}`;
    posts.replaceChildren(errorMessage);
}

async function loadWithFetch() {
    setLoading(true, loadButton);
    posts.replaceChildren();

    try {
        const response = await fetch(API_URL, {
            headers: { Accept: 'application/json' }
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(payload?.message || `Request failed (${response.status}).`);
        }
        renderPosts(unwrapPosts(payload));
    } catch (error) {
        renderError(error);
    } finally {
        setLoading(false);
    }
}

function loadWithXmlHttpRequest() {
    setLoading(true, xhrButton);
    posts.replaceChildren();

    const request = new XMLHttpRequest();
    request.open('GET', API_URL);
    request.setRequestHeader('Accept', 'application/json');

    request.onload = () => {
        try {
            const payload = request.responseText ? JSON.parse(request.responseText) : null;
            if (request.status < 200 || request.status >= 300) {
                throw new Error(payload?.message || `Request failed (${request.status}).`);
            }
            renderPosts(unwrapPosts(payload));
        } catch (error) {
            renderError(error);
        } finally {
            setLoading(false);
        }
    };

    request.onerror = () => {
        renderError(new Error('Network error. Check that the API is running.'));
        setLoading(false);
    };

    request.send();
}

loadButton.addEventListener('click', loadWithFetch);
xhrButton.addEventListener('click', loadWithXmlHttpRequest);