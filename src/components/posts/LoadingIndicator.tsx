interface LoadingIndicatorProps {
    isLoading: boolean;
}

export default function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
    return (
        <div className="loading-indicator" role="status" aria-live="polite" hidden={!isLoading}>
            <span className="loading-spinner" aria-hidden="true" />
            <span>Loading posts...</span>
        </div>
    );
}
