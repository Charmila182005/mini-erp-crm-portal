import {
    useEffect,
    useMemo,
    useState,
    type SyntheticEvent,
} from 'react';

import { useAuth } from '../context/AuthContext';

import {
    createStockMovement,
    getStockMovements,
} from '../services/stockMovement.service';

import {
    getProducts,
} from '../services/product.service';

interface StockMovement {
    id: string;
    product_id: string;
    product_name?: string;
    sku?: string;
    movement_type: 'IN' | 'OUT';
    quantity: number;
    reason: string;
    reference?: string | null;
    created_by?: string;
    created_by_email?: string;
    created_at: string;
}

interface Product {
    id: string;
    product_name: string;
    sku: string;
    category: string;
    unit_price: number;
    current_stock: number;
    minimum_stock_quantity: number;
    warehouse_location: string;
}

interface StockMovementFormData {
    product_id: string;
    movement_type: 'IN' | 'OUT';
    quantity: string;
    reason: string;
}

const emptyForm: StockMovementFormData = {
    product_id: '',
    movement_type: 'IN',
    quantity: '',
    reason: '',
};

const StockMovements = () => {
    const { user } = useAuth();

    /* =========================
       STATE
    ========================= */

    const [movements, setMovements] =
        useState<StockMovement[]>([]);

    const [products, setProducts] =
        useState<Product[]>([]);

    const [search, setSearch] =
        useState('');

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [showForm, setShowForm] =
        useState(false);

    const [form, setForm] =
        useState<StockMovementFormData>({
            ...emptyForm,
        });

    const [isSaving, setIsSaving] =
        useState(false);

    /* =========================
       PERMISSIONS
    ========================= */

    const canManageStock =
        user?.role === 'ADMIN' ||
        user?.role === 'WAREHOUSE';

    /* =========================
       LOAD DATA
    ========================= */

    const loadMovements = async () => {
        try {
            setIsLoading(true);
            setError('');

            const data =
                await getStockMovements();

            setMovements(
                data as StockMovement[]
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load stock movements'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const data =
                await getProducts();

            setProducts(
                data as Product[]
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load products'
            );
        }
    };

    useEffect(() => {
        loadMovements();
        loadProducts();
    }, []);

    /* =========================
       SEARCH
    ========================= */

    const filteredMovements = useMemo(() => {
        const value =
            search.trim().toLowerCase();

        if (!value) {
            return movements;
        }

        return movements.filter(
            (movement) =>
                (
                    movement.product_name ||
                    ''
                )
                    .toLowerCase()
                    .includes(value) ||
                (
                    movement.sku ||
                    ''
                )
                    .toLowerCase()
                    .includes(value) ||
                movement.movement_type
                    .toLowerCase()
                    .includes(value) ||
                movement.reason
                    .toLowerCase()
                    .includes(value)
        );
    }, [movements, search]);

    /* =========================
       FORM
    ========================= */

    const openCreateForm = () => {
        setForm({
            ...emptyForm,
        });

        setError('');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);

        setForm({
            ...emptyForm,
        });

        setError('');
    };

    const handleFormChange = (
        field: keyof StockMovementFormData,
        value: string
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    /* =========================
       CREATE MOVEMENT
    ========================= */

    const handleSubmit = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!form.product_id) {
            setError(
                'Please select a product.'
            );
            return;
        }

        const quantity =
            Number(form.quantity);

        if (
            Number.isNaN(quantity) ||
            quantity <= 0
        ) {
            setError(
                'Quantity must be greater than zero.'
            );
            return;
        }

        if (!Number.isInteger(quantity)) {
            setError(
                'Quantity must be a whole number.'
            );
            return;
        }

        if (!form.reason.trim()) {
            setError(
                'Reason is required.'
            );
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            await createStockMovement({
                product_id:
                    form.product_id,

                movement_type:
                    form.movement_type,

                quantity,

                reason:
                    form.reason.trim(),
            });

            closeForm();

            await Promise.all([
                loadMovements(),
                loadProducts(),
            ]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create stock movement'
            );
        } finally {
            setIsSaving(false);
        }
    };

    /* =========================
       SELECTED PRODUCT
    ========================= */

    const selectedProduct =
        products.find(
            (product) =>
                product.id ===
                form.product_id
        );

    /* =========================
       UI
    ========================= */

    return (
        <div className="module-page">

            {/* HEADER */}

            <div className="module-header">

                <div>

                    <h1>
                        Stock Movements
                    </h1>

                    <p>
                        Track inventory IN and OUT
                        transactions across your
                        warehouse.
                    </p>

                </div>

                {canManageStock && (
                    <button
                        className="primary-button"
                        onClick={
                            openCreateForm
                        }
                    >
                        + Add Movement
                    </button>
                )}

            </div>

            {/* ERROR */}

            {error && (
                <div className="module-error">
                    {error}
                </div>
            )}

            {/* TOOLBAR */}

            <div className="module-toolbar">

                <div className="search-box">

                    <span>🔎</span>

                    <input
                        type="text"
                        placeholder="Search stock movements..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

                <div className="result-count">

                    {filteredMovements.length}{' '}
                    movement
                    {filteredMovements.length !==
                        1
                        ? 's'
                        : ''}

                </div>

            </div>

            {/* TABLE */}

            <div className="data-card">

                {isLoading ? (

                    <div className="table-state">
                        Loading stock movements...
                    </div>

                ) : filteredMovements.length ===
                    0 ? (

                    <div className="table-state">

                        <span>🔄</span>

                        <strong>
                            No stock movements found
                        </strong>

                        <p>
                            Stock transactions will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Performed By
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredMovements.map(
                                    (movement) => (

                                        <tr
                                            key={
                                                movement.id
                                            }
                                        >

                                            <td>

                                                {new Date(
                                                    movement.created_at
                                                ).toLocaleString(
                                                    'en-IN'
                                                )}

                                            </td>

                                            <td>

                                                <div className="customer-cell">

                                                    <div className="customer-avatar">
                                                        📦
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {movement.product_name ||
                                                                'Product'}
                                                        </strong>

                                                        <span>
                                                            {movement.sku ||
                                                                movement.product_id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>

                                                <span
                                                    className={`status-badge ${movement.movement_type ===
                                                            'IN'
                                                            ? 'status-active'
                                                            : 'status-inactive'
                                                        }`}
                                                >
                                                    {movement.movement_type ===
                                                        'IN'
                                                        ? '↑ IN'
                                                        : '↓ OUT'}
                                                </span>

                                            </td>

                                            <td>

                                                <strong>
                                                    {movement.quantity}
                                                </strong>

                                            </td>

                                            <td>
                                                {
                                                    movement.reason
                                                }
                                            </td>

                                            <td>
                                                {
                                                    movement.created_by_email ||
                                                    movement.created_by ||
                                                    '—'
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ADD MOVEMENT MODAL */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="modal-card">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Add Stock Movement
                                </h2>

                                <p>
                                    Record an inventory
                                    IN or OUT transaction.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeForm
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="customer-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="form-grid">

                                {/* PRODUCT */}

                                <div className="form-field full-width">

                                    <label>
                                        Product *
                                    </label>

                                    <select
                                        value={
                                            form.product_id
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'product_id',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select a product
                                        </option>

                                        {products.map(
                                            (product) => (
                                                <option
                                                    key={
                                                        product.id
                                                    }
                                                    value={
                                                        product.id
                                                    }
                                                >
                                                    {product.product_name}{' '}
                                                    —{' '}
                                                    {product.sku}
                                                </option>
                                            )
                                        )}

                                    </select>

                                    {/* CURRENT STOCK INFO */}

                                    {selectedProduct && (
                                        <div
                                            style={{
                                                marginTop:
                                                    '8px',
                                                padding:
                                                    '10px 12px',
                                                borderRadius:
                                                    '8px',
                                                background:
                                                    '#f3f4f6',
                                                fontSize:
                                                    '13px',
                                                color:
                                                    '#4b5563',
                                            }}
                                        >

                                            Current stock:{' '}
                                            <strong>
                                                {
                                                    selectedProduct.current_stock
                                                }
                                            </strong>

                                            {'  |  '}

                                            Minimum stock:{' '}
                                            <strong>
                                                {
                                                    selectedProduct.minimum_stock_quantity
                                                }
                                            </strong>

                                            {'  |  '}

                                            Location:{' '}
                                            <strong>
                                                {
                                                    selectedProduct.warehouse_location
                                                }
                                            </strong>

                                        </div>
                                    )}

                                </div>

                                {/* MOVEMENT TYPE */}

                                <div className="form-field">

                                    <label>
                                        Movement Type *
                                    </label>

                                    <select
                                        value={
                                            form.movement_type
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'movement_type',
                                                event
                                                    .target
                                                    .value as
                                                'IN' |
                                                'OUT'
                                            )
                                        }
                                    >

                                        <option value="IN">
                                            IN — Stock Received
                                        </option>

                                        <option value="OUT">
                                            OUT — Stock Issued
                                        </option>

                                    </select>

                                </div>

                                {/* QUANTITY */}

                                <div className="form-field">

                                    <label>
                                        Quantity *
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={
                                            form.quantity
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'quantity',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter quantity"
                                        required
                                    />

                                </div>

                                {/* REASON */}

                                <div className="form-field full-width">

                                    <label>
                                        Reason *
                                    </label>

                                    <input
                                        value={
                                            form.reason
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'reason',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. New stock received"
                                        required
                                    />

                                </div>

                            </div>

                            {/* WARNING FOR OUT */}

                            {form.movement_type ===
                                'OUT' &&
                                selectedProduct &&
                                Number(
                                    form.quantity
                                ) >
                                selectedProduct.current_stock && (
                                    <div
                                        className="module-error"
                                        style={{
                                            marginTop:
                                                '10px',
                                        }}
                                    >
                                        ⚠️ Insufficient stock.
                                        Available:{' '}
                                        {
                                            selectedProduct.current_stock
                                        }
                                        , Requested:{' '}
                                        {
                                            form.quantity ||
                                            0
                                        }
                                    </div>
                                )}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeForm
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        isSaving
                                    }
                                >
                                    {isSaving
                                        ? 'Saving...'
                                        : 'Add Movement'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default StockMovements;