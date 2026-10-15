interface PostToolbarProps {
    onNewPost: () => void;
}

export default function PostToolbar({ onNewPost }: PostToolbarProps) {
    return (
        <div className="post-toolbar">
            <button className="primary-button" type="button" onClick={onNewPost}>
                New post
            </button>
        </div>
    );
}
