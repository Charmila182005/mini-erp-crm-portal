import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError('');
        setIsSubmitting(true);

        try {
            await login({
                email,
                password,
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Login failed'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-logo">ERP</div>

                    <h1>
                        Mini ERP + CRM
                    </h1>

                    <p>
                        Operations Management Portal
                    </p>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Signing in...'
                            : 'Sign In'}
                    </button>
                </form>

                <div className="demo-credentials">
                    <p>Demo accounts</p>

                    <span>
                        Admin · admin@erp.com
                    </span>

                    <span>
                        Sales · sales@erp.com
                    </span>

                    <span>
                        Warehouse · warehouse@erp.com
                    </span>

                    <span>
                        Accounts · accounts@erp.com
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;