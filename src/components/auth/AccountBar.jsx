import React from 'react';

export default function AccountBar({ user, onSignOut }) {
    return (
        <div className="account-bar">
            <span>Signed in as {user.email}</span>
            <button className="secondary-button" type="button" onClick={onSignOut}>Sign out</button>
        </div>
    );
}
