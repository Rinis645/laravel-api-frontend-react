import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AuthMode } from '../../types';
import AuthForm from './AuthForm';

function AuthFormHarness() {
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    return (
        <AuthForm
            authMode={authMode}
            name=""
            email=""
            password=""
            isLoggingIn={false}
            onAuthenticate={vi.fn()}
            onNameChange={vi.fn()}
            onEmailChange={vi.fn()}
            onPasswordChange={vi.fn()}
            onAuthModeChange={() => setAuthMode(mode => mode === 'login' ? 'register' : 'login')}
        />
    );
}

describe('AuthForm', () => {
    it('switches from sign-in to account creation', () => {
        render(<AuthFormHarness />);

        fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));

        expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeRequired();
        expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    });

    it('disables the submit button while authentication is in progress', () => {
        render(
            <AuthForm
                authMode="login"
                name=""
                email=""
                password=""
                isLoggingIn
                onAuthenticate={vi.fn()}
                onNameChange={vi.fn()}
                onEmailChange={vi.fn()}
                onPasswordChange={vi.fn()}
                onAuthModeChange={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    });
});
