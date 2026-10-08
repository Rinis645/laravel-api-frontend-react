import React from 'react';

export default function PostToolbar({ onNewPost }) {
    return (
        <div className="post-toolbar">
            <button className="primary-button" type="button" onClick={onNewPost}>
                New post
            </button>
        </div>
    );
}
