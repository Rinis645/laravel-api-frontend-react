import React from 'react';

export default function PostCard({ post, canManage, isDeleting, onEdit, onDelete }) {
    return (
        <article className="post-card">
            <h2>{post.title || 'Untitled post'}</h2>
            <p>{post.body || ''}</p>
            {canManage && (
                <div className="post-actions">
                    <button className="text-button" type="button" onClick={onEdit}>
                        Edit
                    </button>
                    <button
                        className="danger-button"
                        type="button"
                        onClick={onDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            )}
        </article>
    );
}
