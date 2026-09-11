import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

import {
    apiRequest,
    getToken,
    removeToken,
    setToken,
} from '../services/api';

import type {
    AuthUser,
    LoginRequest,
    LoginResponse,
} from '../types/auth.types';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<
    AuthContextType | undefined
>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({
    children,
}: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setAuthToken] = useState<string | null>(
        getToken()
    );
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            const existingToken = getToken();

            if (!existingToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await apiRequest<{
                    success: boolean;
                    data: {
                        user: AuthUser;
                    };
                }>('/auth/me');

                setUser(response.data.user);
                setAuthToken(existingToken);
            } catch (error) {
                console.error(
                    'Session validation failed:',
                    error
                );

                removeToken();
                setAuthToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateSession();
    }, []);

    const login = async (
        credentials: LoginRequest
    ): Promise<void> => {
        const response =
            await apiRequest<LoginResponse>(
                '/auth/login',
                {
                    method: 'POST',
                    auth: false,
                    body: JSON.stringify(credentials),
                }
            );

        setToken(response.data.token);
        setAuthToken(response.data.token);
        setUser(response.data.user);
    };

    const logout = (): void => {
        removeToken();
        setAuthToken(null);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider'
        );
    }

    return context;
};