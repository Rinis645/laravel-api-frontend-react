import type { ActiveButton } from '../../types';
import LoadingIndicator from './LoadingIndicator';

interface PostsLoaderProps {
    activeButton: ActiveButton;
    isLoading: boolean;
    onLoadWithFetch: () => void;
    onLoadWithXmlHttpRequest: () => void;
}

export default function PostsLoader({
    activeButton,
    isLoading,
    onLoadWithFetch,
    onLoadWithXmlHttpRequest
}: PostsLoaderProps) {
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
