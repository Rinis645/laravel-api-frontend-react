import type { Post, User } from '../../types';
import PostCard from './PostCard';

interface PostListProps {
    posts: Post[] | null;
    error: string;
    isLoading: boolean;
    isSaving: boolean;
    user: User | null;
    deletingPostId: Post['id'] | null;
    onEditPost: (post: Post) => void;
    onDeletePost: (post: Post) => void;
}

export default function PostList({
    posts,
    error,
    isLoading,
    isSaving,
    user,
    deletingPostId,
    onEditPost,
    onDeletePost
}: PostListProps) {
    return (
        <div id="posts" aria-live="polite" aria-busy={isLoading || isSaving}>
            {error && <p className="error-message" role="alert">{error}</p>}
            {posts?.length === 0 && <p className="empty-message">No posts to show yet.</p>}
            {posts?.map(post => {
                const canManagePost = Boolean(
                    user && post.user_id != null && String(post.user_id) === String(user.id)
                );

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
