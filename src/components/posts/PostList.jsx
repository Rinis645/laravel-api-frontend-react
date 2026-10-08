import React from 'react';
import PostCard from './PostCard.jsx';

export default function PostList({
    posts,
    error,
    isLoading,
    isSaving,
    user,
    deletingPostId,
    onEditPost,
    onDeletePost
}) {
    return (
        <div id="posts" aria-live="polite" aria-busy={isLoading || isSaving}>
            {error && <p className="error-message" role="alert">{error}</p>}
            {posts?.length === 0 && <p className="empty-message">No posts to show yet.</p>}
            {posts?.map(post => {
                const canManagePost = user && String(post.user_id) === String(user.id);

                return (
                    <PostCard
                        key={post.id}
                        post={post}
                        canManage={canManagePost}
                        isDeleting={deletingPostId === post.id}
                        onEdit={() => onEditPost(post)}
                        onDelete={() => onDeletePost(post)}
                    />
                );
            })}
        </div>
    );
}
