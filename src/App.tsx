import { useState } from 'react';
import AccountBar from './components/auth/AccountBar';
import AuthForm from './components/auth/AuthForm';
import PostForm from './components/posts/PostForm';
import PostList from './components/posts/PostList';
import PostToolbar from './components/posts/PostToolbar';
import PostsLoader from './components/posts/PostsLoader';
import useAuth from './hooks/useAuth';
import usePosts from './hooks/usePosts';

export default function App() {
    const [error, setError] = useState('');
    const auth = useAuth(setError);
    const posts = usePosts(auth.apiRequest, setError);

    return (
        <main>
            <h1>Posts</h1>
            {auth.user ? (
                <AccountBar
                    user={auth.user}
                    onSignOut={() => auth.signOut(posts.resetPostFormForSignOut)}
                />
            ) : (
                <AuthForm
                    authMode={auth.authMode}
                    name={auth.name}
                    email={auth.email}
                    password={auth.password}
                    isLoggingIn={auth.isLoggingIn}
                    onAuthenticate={auth.authenticate}
                    onNameChange={event => auth.setName(event.target.value)}
                    onEmailChange={event => auth.setEmail(event.target.value)}
                    onPasswordChange={event => auth.setPassword(event.target.value)}
                    onAuthModeChange={auth.toggleAuthMode}
                />
            )}

            <PostsLoader
                activeButton={posts.activeButton}
                isLoading={posts.isLoading}
                onLoadWithFetch={posts.loadWithFetch}
                onLoadWithXmlHttpRequest={posts.loadWithXmlHttpRequest}
            />

            {auth.user && <PostToolbar onNewPost={posts.openNewPostForm} />}
            {posts.isFormOpen && (
                <PostForm
                    draft={posts.draft}
                    editingPost={posts.editingPost}
                    isSaving={posts.isSaving}
                    onDraftChange={posts.setDraft}
                    onSubmit={posts.savePost}
                    onCancel={posts.closePostForm}
                />
            )}
            <PostList
                posts={posts.posts}
                error={error}
                isLoading={posts.isLoading}
                isSaving={posts.isSaving}
                user={auth.user}
                deletingPostId={posts.deletingPostId}
                onEditPost={posts.openEditPostForm}
                onDeletePost={posts.deletePost}
            />
        </main>
    );
}
