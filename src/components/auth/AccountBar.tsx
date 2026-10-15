import type { User } from '../../types';

interface AccountBarProps {
    user: User;
    onSignOut: () => void;
}

export default function AccountBar({ user, onSignOut }: AccountBarProps) {
    return (
        <div className="account-bar">
            <span>Signed in as {user.email}</span>
            <button className="secondary-button" type="button" onClick={onSignOut}>Sign out</button>
        </div>
    );
}
