import React from 'react';
import LoadingIndicator from './LoadingIndicator.jsx';

export default function PostsLoader({ activeButton, isLoading, onLoadWithFetch, onLoadWithXmlHttpRequest }) {
    return (
        <>
            <button id="loadPosts" type="button" onClick={onLoadWithFetch} disabled={isLoading}>
                {activeButton === 'fetch' ? 'Loading...' : 'Load posts'}
            </button>
            <button id="loadPostsXHR" type="button" onClick={onLoadWithXmlHttpRequest} disabled={isLoading}>
                {activeButton === 'xhr' ? 'Loading...' : 'Load posts (XMLHttpRequest)'}
            </button>
            <LoadingIndicator isLoading={isLoading} />
        </>
    );
}
