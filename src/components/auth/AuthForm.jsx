import React from 'react';

export default function AuthForm({
    authMode,
    name,
    email,
    password,
    isLoggingIn,
    onAuthenticate,
    onNameChange,
    onEmailChange,
    onPasswordChange,
    onAuthModeChange
}) {
    const isRegistration = authMode === 'register';

    return (
        <form className={`login-form ${isRegistration ? 'register-form' : ''}`} onSubmit={onAuthenticate}>
            <h2>{isRegistration ? 'Create an account' : 'Sign in to manage posts'}</h2>
            {isRegistration && (
                <label>
                    Name
                    <input
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={onNameChange}
                        required
                    />
                </label>
            )}
            <label>
                Email
                <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={onEmailChange}
                    required
                />
            </label>
            <label>
                Password
                <input
                    type="password"
                    autoComplete={isRegistration ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={onPasswordChange}
                    required
                />
            </label>
            <button className="primary-button" type="submit" disabled={isLoggingIn}>
                {isLoggingIn
                    ? (isRegistration ? 'Creating account...' : 'Signing in...')
                    : (isRegistration ? 'Create account' : 'Sign in')}
            </button>
            <button className="text-button auth-mode-button" type="button" onClick={onAuthModeChange}>
                {isRegistration ? 'Already have an account? Sign in' : 'Create an account'}
            </button>
        </form>
    );
}
