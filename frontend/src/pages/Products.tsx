import {
    useEffect,
    useMemo,
    useState,
    type SyntheticEvent,
} from 'react';

import { useAuth } from '../context/AuthContext';

import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from '../services/product.service';

interface Product {
    id: string;
    product_name: string;
    sku: string;
    category: string;
    unit_price: number;
    current_stock: number;
    minimum_stock_quantity: number;
    warehouse_location: string;
    created_at?: string;
    updated_at?: string;
}

interface ProductFormData {
    product_name: string;
    sku: string;
    category: string;
    unit_price: string;
    current_stock: string;
    minimum_stock_quantity: string;
    warehouse_location: string;
}

const emptyForm: ProductFormData = {
    product_name: '',
    sku: '',
    category: '',
    unit_price: '',
    current_stock: '',
    minimum_stock_quantity: '',
    warehouse_location: '',
};

const Products = () => {
    const { user } = useAuth();

    /* =========================
       STATE
    ========================= */

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

    const [editingProduct, setEditingProduct] =
        useState<Product | null>(null);

    const [form, setForm] =
        useState<ProductFormData>({
            ...emptyForm,
        });

    const [isSaving, setIsSaving] =
        useState(false);

    /* =========================
       PERMISSIONS
    ========================= */

    const canManageProducts =
        user?.role === 'ADMIN' ||
        user?.role === 'WAREHOUSE';

    /* =========================
       LOAD PRODUCTS
    ========================= */

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            setError('');

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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    /* =========================
       SEARCH
    ========================= */

    const filteredProducts = useMemo(() => {
        const value =
            search.trim().toLowerCase();

        if (!value) {
            return products;
        }

        return products.filter(
            (product) =>
                product.product_name
                    .toLowerCase()
                    .includes(value) ||
                product.sku
                    .toLowerCase()
                    .includes(value) ||
                product.category
                    .toLowerCase()
                    .includes(value) ||
                product.warehouse_location
                    .toLowerCase()
                    .includes(value)
        );
    }, [products, search]);

    /* =========================
       FORM
    ========================= */

    const openCreateForm = () => {
        setEditingProduct(null);

        setForm({
            ...emptyForm,
        });

        setError('');
        setShowForm(true);
    };

    const openEditForm = (
        product: Product
    ) => {
        setEditingProduct(product);

        setForm({
            product_name:
                product.product_name,

            sku:
                product.sku,

            category:
                product.category,

            unit_price:
                String(product.unit_price),

            current_stock:
                String(product.current_stock),

            minimum_stock_quantity:
                String(
                    product.minimum_stock_quantity
                ),

            warehouse_location:
                product.warehouse_location,
        });

        setError('');
        setShowForm(true);
    };

    const handleFormChange = (
        field: keyof ProductFormData,
        value: string
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    /* =========================
       CREATE / UPDATE
    ========================= */

    const handleSubmit = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setIsSaving(true);
            setError('');

            const payload = {
                product_name:
                    form.product_name.trim(),

                sku:
                    form.sku.trim(),

                category:
                    form.category.trim(),

                unit_price:
                    Number(form.unit_price),

                current_stock:
                    Number(form.current_stock),

                minimum_stock_quantity:
                    Number(
                        form.minimum_stock_quantity
                    ),

                warehouse_location:
                    form.warehouse_location.trim(),
            };

            if (
                !payload.product_name ||
                !payload.sku
            ) {
                throw new Error(
                    'Product name and SKU are required.'
                );
            }

            if (
                Number.isNaN(
                    payload.unit_price
                ) ||
                payload.unit_price < 0
            ) {
                throw new Error(
                    'Unit price must be a valid positive number.'
                );
            }

            if (
                Number.isNaN(
                    payload.current_stock
                ) ||
                payload.current_stock < 0
            ) {
                throw new Error(
                    'Current stock cannot be negative.'
                );
            }

            if (
                Number.isNaN(
                    payload.minimum_stock_quantity
                ) ||
                payload.minimum_stock_quantity < 0
            ) {
                throw new Error(
                    'Minimum stock quantity cannot be negative.'
                );
            }

            if (editingProduct) {
                await updateProduct(
                    editingProduct.id,
                    payload
                );
            } else {
                await createProduct(
                    payload
                );
            }

            setShowForm(false);
            setEditingProduct(null);

            setForm({
                ...emptyForm,
            });

            await loadProducts();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to save product'
            );
        } finally {
            setIsSaving(false);
        }
    };

    /* =========================
       DELETE
    ========================= */

    const handleDelete = async (
        product: Product
    ) => {
        const confirmed =
            window.confirm(
                `Delete product "${product.product_name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError('');

            await deleteProduct(
                product.id
            );

            await loadProducts();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete product'
            );
        }
    };

    /* =========================
       STOCK STATUS
    ========================= */

    const getStockStatus = (
        product: Product
    ) => {
        if (
            product.current_stock === 0
        ) {
            return {
                label: 'Out of Stock',
                className:
                    'status-inactive',
            };
        }

        if (
            product.current_stock <=
            product.minimum_stock_quantity
        ) {
            return {
                label: 'Low Stock',
                className:
                    'status-warning',
            };
        }

        return {
            label: 'In Stock',
            className:
                'status-active',
        };
    };

    /* =========================
       UI
    ========================= */

    return (
        <div className="module-page">

            {/* HEADER */}

            <div className="module-header">

                <div>

                    <h1>
                        Products & Inventory
                    </h1>

                    <p>
                        Manage products, pricing,
                        stock levels and warehouse
                        locations.
                    </p>

                </div>

                {canManageProducts && (
                    <button
                        className="primary-button"
                        onClick={
                            openCreateForm
                        }
                    >
                        + Add Product
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
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

                <div className="result-count">

                    {filteredProducts.length}{' '}
                    product
                    {filteredProducts.length !==
                        1
                        ? 's'
                        : ''}

                </div>

            </div>

            {/* TABLE */}

            <div className="data-card">

                {isLoading ? (

                    <div className="table-state">
                        Loading products...
                    </div>

                ) : filteredProducts.length ===
                    0 ? (

                    <div className="table-state">

                        <span>📦</span>

                        <strong>
                            No products found
                        </strong>

                        <p>
                            Try another search or
                            add a new product.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        SKU
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Unit Price
                                    </th>

                                    <th>
                                        Current Stock
                                    </th>

                                    <th>
                                        Stock Status
                                    </th>

                                    <th>
                                        Warehouse
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredProducts.map(
                                    (product) => {

                                        const stockStatus =
                                            getStockStatus(
                                                product
                                            );

                                        return (
                                            <tr
                                                key={
                                                    product.id
                                                }
                                            >

                                                {/* PRODUCT */}

                                                <td>

                                                    <div className="customer-cell">

                                                        <div className="customer-avatar">
                                                            📦
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    product.product_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                Min. stock:{' '}
                                                                {
                                                                    product.minimum_stock_quantity
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* SKU */}

                                                <td>
                                                    <strong>
                                                        {
                                                            product.sku
                                                        }
                                                    </strong>
                                                </td>

                                                {/* CATEGORY */}

                                                <td>
                                                    <span className="type-badge">
                                                        {
                                                            product.category
                                                        }
                                                    </span>
                                                </td>

                                                {/* PRICE */}

                                                <td>

                                                    ₹
                                                    {Number(
                                                        product.unit_price
                                                    ).toLocaleString(
                                                        'en-IN',
                                                        {
                                                            minimumFractionDigits:
                                                                2,
                                                        }
                                                    )}

                                                </td>

                                                {/* STOCK */}

                                                <td>

                                                    <strong
                                                        style={{
                                                            fontSize:
                                                                '15px',
                                                        }}
                                                    >
                                                        {
                                                            product.current_stock
                                                        }
                                                    </strong>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`status-badge ${stockStatus.className}`}
                                                    >
                                                        {
                                                            stockStatus.label
                                                        }
                                                    </span>

                                                </td>

                                                {/* WAREHOUSE */}

                                                <td>
                                                    {
                                                        product.warehouse_location
                                                    }
                                                </td>

                                                {/* ACTIONS */}

                                                <td>

                                                    {canManageProducts ? (

                                                        <div className="table-actions">

                                                            <button
                                                                type="button"
                                                                className="icon-button"
                                                                title="Edit product"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        product
                                                                    )
                                                                }
                                                            >
                                                                ✏️
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="icon-button danger"
                                                                title="Delete product"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product
                                                                    )
                                                                }
                                                            >
                                                                🗑️
                                                            </button>

                                                        </div>

                                                    ) : (

                                                        <span
                                                            style={{
                                                                color:
                                                                    '#9ca3af',
                                                                fontSize:
                                                                    '13px',
                                                            }}
                                                        >
                                                            View only
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ADD / EDIT MODAL */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="modal-card">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {editingProduct
                                        ? 'Edit Product'
                                        : 'Add Product'}
                                </h2>

                                <p>
                                    Enter product and
                                    inventory details.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setShowForm(
                                        false
                                    )
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

                                {/* PRODUCT NAME */}

                                <div className="form-field">

                                    <label>
                                        Product Name *
                                    </label>

                                    <input
                                        value={
                                            form.product_name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'product_name',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Wireless Mouse"
                                        required
                                    />

                                </div>

                                {/* SKU */}

                                <div className="form-field">

                                    <label>
                                        SKU *
                                    </label>

                                    <input
                                        value={
                                            form.sku
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'sku',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. WM-001"
                                        required
                                    />

                                </div>

                                {/* CATEGORY */}

                                <div className="form-field">

                                    <label>
                                        Category *
                                    </label>

                                    <input
                                        value={
                                            form.category
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'category',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Electronics"
                                        required
                                    />

                                </div>

                                {/* PRICE */}

                                <div className="form-field">

                                    <label>
                                        Unit Price *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            form.unit_price
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'unit_price',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="0.00"
                                        required
                                    />

                                </div>

                                {/* CURRENT STOCK */}

                                <div className="form-field">

                                    <label>
                                        Current Stock *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            form.current_stock
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'current_stock',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="0"
                                        required
                                    />

                                </div>

                                {/* MIN STOCK */}

                                <div className="form-field">

                                    <label>
                                        Minimum Stock *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            form.minimum_stock_quantity
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'minimum_stock_quantity',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="10"
                                        required
                                    />

                                </div>

                                {/* WAREHOUSE */}

                                <div className="form-field full-width">

                                    <label>
                                        Warehouse Location *
                                    </label>

                                    <input
                                        value={
                                            form.warehouse_location
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'warehouse_location',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="e.g. Warehouse A - Rack 12"
                                        required
                                    />

                                </div>

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowForm(
                                            false
                                        )
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
                                        : editingProduct
                                            ? 'Update Product'
                                            : 'Create Product'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Products;