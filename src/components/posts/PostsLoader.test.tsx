import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PostsLoader from './PostsLoader';

describe('PostsLoader', () => {
    it('calls the selected loading method', () => {
        const onLoadWithFetch = vi.fn();
        const onLoadWithXmlHttpRequest = vi.fn();
        render(
            <PostsLoader
                activeButton=""
                isLoading={false}
                onLoadWithFetch={onLoadWithFetch}
                onLoadWithXmlHttpRequest={onLoadWithXmlHttpRequest}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Load posts' }));
        fireEvent.click(screen.getByRole('button', { name: 'Load posts (XMLHttpRequest)' }));

        expect(onLoadWithFetch).toHaveBeenCalledOnce();
        expect(onLoadWithXmlHttpRequest).toHaveBeenCalledOnce();
    });

    it('shows loading state and prevents another request while loading', () => {
        render(
            <PostsLoader
                activeButton="fetch"
                isLoading
                onLoadWithFetch={vi.fn()}
                onLoadWithXmlHttpRequest={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Load posts (XMLHttpRequest)' })).toBeDisabled();
        expect(screen.getByRole('status')).toBeVisible();
    });
});
