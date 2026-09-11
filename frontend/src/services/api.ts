const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3000/api';

export const getToken = (): string | null => {
    return localStorage.getItem('erp_token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('erp_token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('erp_token');
};

interface ApiOptions extends RequestInit {
    auth?: boolean;
}

export const apiRequest = async <T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> => {
    const {
        auth = true,
        headers,
        ...requestOptions
    } = options;

    const requestHeaders = new Headers(headers);

    requestHeaders.set(
        'Content-Type',
        'application/json'
    );

    if (auth) {
        const token = getToken();

        if (token) {
            requestHeaders.set(
                'Authorization',
                `Bearer ${token}`
            );
        }
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...requestOptions,
            headers: requestHeaders,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Something went wrong'
        );
    }

    return data as T;
};