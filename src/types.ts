export type Id = number | string;

export interface Post {
    id: Id;
    user_id?: Id | null;
    title?: string | null;
    body?: string | null;
}

export interface PostDraft {
    title: string;
    body: string;
}

export interface User {
    id: Id;
    email: string;
    name?: string;
}

export type AuthMode = 'login' | 'register';
export type ActiveButton = 'fetch' | 'xhr' | '';

export interface AuthResponse {
    token: string;
    user: User;
}
