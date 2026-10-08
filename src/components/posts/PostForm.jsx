import React from 'react';

export default function PostForm({ draft, editingPost, isSaving, onDraftChange, onSubmit, onCancel }) {
    return (
        <form className="post-form" onSubmit={onSubmit}>
            <h2>{editingPost ? 'Edit post' : 'New post'}</h2>
            <label>
                Title
                <input
                    type="text"
                    maxLength="255"
                    value={draft.title}
                    onChange={event => onDraftChange({ ...draft, title: event.target.value })}
                    required
                />
            </label>
            <label>
                Body
                <textarea
                    rows="5"
                    value={draft.body}
                    onChange={event => onDraftChange({ ...draft, body: event.target.value })}
                    required
                />
            </label>
            <div className="form-actions">
                <button className="primary-button" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save post'}
                </button>
                <button className="secondary-button" type="button" onClick={onCancel} disabled={isSaving}>
                    Cancel
                </button>
            </div>
        </form>
    );
}
