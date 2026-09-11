import {
    useEffect,
    useState,
    type SyntheticEvent,
} from 'react';

import { useAuth } from '../context/AuthContext';

import {
    createChallan,
    getChallans,
    confirmChallan,
    cancelChallan,
} from '../services/challan.service';

import { getCustomers } from '../services/customer.service';
import { getProducts } from '../services/product.service';

interface Customer {
    id: string;
    customer_name: string;
    business_name?: string;
}

interface Product {
    id: string;
    product_name: string;
    sku: string;
    unit_price: number;
    current_stock: number;
}

interface ChallanItem {
    id?: string;
    product_id: string;
    product_name: string;
    sku: string;
    unit_price: number;
    quantity: number;
}

interface Challan {
    id: string;
    challan_number: string;
    customer_id: string;
    customer_name?: string;
    total_quantity: number;
    status: 'Draft' | 'Confirmed' | 'Cancelled';
    created_at: string;
    items?: ChallanItem[];
}

interface FormItem {
    product_id: string;
    quantity: string;
}

const SalesChallans = () => {
    const { user } = useAuth();

    const [challans, setChallans] =
        useState<Challan[]>([]);

    const [customers, setCustomers] =
        useState<Customer[]>([]);

    const [products, setProducts] =
        useState<Product[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [showForm, setShowForm] =
        useState(false);

    const [isSaving, setIsSaving] =
        useState(false);

    const [challanNumber, setChallanNumber] =
        useState('');

    const [customerId, setCustomerId] =
        useState('');

    const [items, setItems] =
        useState<FormItem[]>([
            {
                product_id: '',
                quantity: '',
            },
        ]);

    const [selectedChallan, setSelectedChallan] =
        useState<Challan | null>(null);

    const [showDetails, setShowDetails] =
        useState(false);

    // Search and filter
    const [searchTerm, setSearchTerm] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState<
            'All' |
            'Draft' |
            'Confirmed' |
            'Cancelled'
        >('All');

    // Pagination
    const [currentPage, setCurrentPage] =
        useState(1);

    const itemsPerPage = 5;

    const canCreate =
        user?.role === 'ADMIN' ||
        user?.role === 'SALES';

    const canConfirm =
        user?.role === 'ADMIN' ||
        user?.role === 'WAREHOUSE';

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError('');

            const [
                challanData,
                customerData,
                productData,
            ] = await Promise.all([
                getChallans(),
                getCustomers(),
                getProducts(),
            ]);

            setChallans(
                challanData as Challan[]
            );

            setCustomers(
                customerData as Customer[]
            );

            setProducts(
                productData as Product[]
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load challan data'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openCreateForm = () => {
        setChallanNumber(
            `CHL-${Date.now()}`
        );

        setCustomerId('');

        setItems([
            {
                product_id: '',
                quantity: '',
            },
        ]);

        setError('');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setError('');
    };

    const addItem = () => {
        setItems((previous) => [
            ...previous,
            {
                product_id: '',
                quantity: '',
            },
        ]);
    };

    const removeItem = (index: number) => {
        setItems((previous) =>
            previous.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    };

    const updateItem = (
        index: number,
        field: keyof FormItem,
        value: string
    ) => {
        setItems((previous) =>
            previous.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                            ...item,
                            [field]: value,
                        }
                        : item
            )
        );
    };

    const handleSubmit = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!challanNumber.trim()) {
            setError(
                'Challan number is required.'
            );
            return;
        }

        if (!customerId) {
            setError(
                'Please select a customer.'
            );
            return;
        }

        if (items.length === 0) {
            setError(
                'Add at least one product.'
            );
            return;
        }

        const validItems = items.filter(
            (item) =>
                item.product_id &&
                Number(item.quantity) > 0
        );

        if (
            validItems.length !==
            items.length
        ) {
            setError(
                'Please select a product and valid quantity for every item.'
            );
            return;
        }

        const duplicateProducts =
            validItems.map(
                (item) => item.product_id
            );

        if (
            new Set(duplicateProducts).size !==
            duplicateProducts.length
        ) {
            setError(
                'A product cannot be added twice to the same challan.'
            );
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            await createChallan({
                challan_number:
                    challanNumber.trim(),

                customer_id:
                    customerId,

                items: validItems.map(
                    (item) => ({
                        product_id:
                            item.product_id,

                        quantity:
                            Number(
                                item.quantity
                            ),
                    })
                ),
            });

            closeForm();

            await loadData();

            setCurrentPage(1);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create challan'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirm = async (
        challan: Challan
    ) => {
        const confirmed =
            window.confirm(
                `Confirm challan ${challan.challan_number}? This will reduce stock.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError('');

            await confirmChallan(
                challan.id
            );

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to confirm challan'
            );
        }
    };

    const handleCancel = async (
        challan: Challan
    ) => {
        const confirmed =
            window.confirm(
                `Cancel challan ${challan.challan_number}?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError('');

            await cancelChallan(
                challan.id
            );

            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to cancel challan'
            );
        }
    };

    const viewDetails = (
        challan: Challan
    ) => {
        setSelectedChallan(challan);
        setShowDetails(true);
    };

    /*
     * FILTERING
     */
    const filteredChallans =
        challans.filter((challan) => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                !search ||
                challan.challan_number
                    .toLowerCase()
                    .includes(search) ||
                (
                    challan.customer_name ||
                    ''
                )
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === 'All' ||
                challan.status ===
                statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    /*
     * PAGINATION
     */
    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredChallans.length /
            itemsPerPage
        )
    );

    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages
        );

    const startIndex =
        (safeCurrentPage - 1) *
        itemsPerPage;

    const paginatedChallans =
        filteredChallans.slice(
            startIndex,
            startIndex + itemsPerPage
        );

    const handleSearchChange = (
        value: string
    ) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (
        value: string
    ) => {
        setStatusFilter(
            value as
            | 'All'
            | 'Draft'
            | 'Confirmed'
            | 'Cancelled'
        );

        setCurrentPage(1);
    };

    return (
        <div className="module-page">

            {/* HEADER */}
            <div className="module-header">

                <div>
                    <h1>
                        Sales Challans
                    </h1>

                    <p>
                        Create, manage and confirm
                        sales challans.
                    </p>
                </div>

                {canCreate && (
                    <button
                        className="primary-button"
                        onClick={
                            openCreateForm
                        }
                    >
                        + Create Challan
                    </button>
                )}

            </div>

            {/* ERROR */}
            {error && (
                <div className="module-error">
                    {error}
                </div>
            )}

            <div className="data-card">

                {/* SEARCH + FILTER */}
                {!isLoading &&
                    challans.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom:
                                    '16px',
                                flexWrap:
                                    'wrap',
                                alignItems:
                                    'center',
                            }}
                        >

                            <input
                                type="text"
                                placeholder="Search challan or customer..."
                                value={
                                    searchTerm
                                }
                                onChange={(
                                    event
                                ) =>
                                    handleSearchChange(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                style={{
                                    padding:
                                        '10px 12px',
                                    border:
                                        '1px solid #d1d5db',
                                    borderRadius:
                                        '6px',
                                    minWidth:
                                        '250px',
                                }}
                            />

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(
                                    event
                                ) =>
                                    handleStatusChange(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                style={{
                                    padding:
                                        '10px 12px',
                                    border:
                                        '1px solid #d1d5db',
                                    borderRadius:
                                        '6px',
                                }}
                            >
                                <option value="All">
                                    All Statuses
                                </option>

                                <option value="Draft">
                                    Draft
                                </option>

                                <option value="Confirmed">
                                    Confirmed
                                </option>

                                <option value="Cancelled">
                                    Cancelled
                                </option>
                            </select>

                            <span
                                style={{
                                    fontSize:
                                        '13px',
                                    color:
                                        '#6b7280',
                                }}
                            >
                                {filteredChallans.length}{' '}
                                challan
                                {filteredChallans.length !==
                                    1
                                    ? 's'
                                    : ''}{' '}
                                found
                            </span>

                        </div>
                    )}

                {isLoading ? (

                    <div className="table-state">
                        Loading challans...
                    </div>

                ) : challans.length === 0 ? (

                    <div className="table-state">
                        <span>🧾</span>

                        <strong>
                            No challans found
                        </strong>

                        <p>
                            Create your first
                            sales challan.
                        </p>
                    </div>

                ) : filteredChallans.length ===
                    0 ? (

                    <div className="table-state">
                        <span>🔍</span>

                        <strong>
                            No matching challans
                        </strong>

                        <p>
                            Try changing your
                            search or status
                            filter.
                        </p>
                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>
                                <tr>

                                    <th>
                                        Challan No.
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {paginatedChallans.map(
                                    (challan) => (

                                        <tr
                                            key={
                                                challan.id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        challan.challan_number
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    challan.customer_name ||
                                                    challan.customer_id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    challan.total_quantity
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-badge ${challan.status ===
                                                        'Confirmed'
                                                        ? 'status-active'
                                                        : challan.status ===
                                                            'Cancelled'
                                                            ? 'status-inactive'
                                                            : 'type-badge'
                                                        }`}
                                                >
                                                    {
                                                        challan.status
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {new Date(
                                                    challan.created_at
                                                ).toLocaleDateString(
                                                    'en-IN'
                                                )}
                                            </td>

                                            <td>

                                                <div className="table-actions">

                                                    {/* VIEW */}
                                                    <button
                                                        type="button"
                                                        className="icon-button"
                                                        title="View"
                                                        onClick={() =>
                                                            viewDetails(
                                                                challan
                                                            )
                                                        }
                                                    >
                                                        👁️
                                                    </button>

                                                    {/* CONFIRM */}
                                                    {canConfirm &&
                                                        challan.status ===
                                                        'Draft' && (
                                                            <button
                                                                type="button"
                                                                className="primary-button"
                                                                style={{
                                                                    padding:
                                                                        '7px 12px',
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                                onClick={() =>
                                                                    handleConfirm(
                                                                        challan
                                                                    )
                                                                }
                                                            >
                                                                Confirm
                                                            </button>
                                                        )}

                                                    {/* CANCEL */}
                                                    {canCreate &&
                                                        challan.status ===
                                                        'Draft' && (
                                                            <button
                                                                type="button"
                                                                className="secondary-button"
                                                                style={{
                                                                    padding:
                                                                        '7px 12px',
                                                                    fontSize:
                                                                        '12px',
                                                                }}
                                                                onClick={() =>
                                                                    handleCancel(
                                                                        challan
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                        {/* PAGINATION */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent:
                                    'center',
                                alignItems:
                                    'center',
                                gap: '16px',
                                padding:
                                    '16px',
                                borderTop:
                                    '1px solid #e5e7eb',
                            }}
                        >

                            <button
                                type="button"
                                className="secondary-button"
                                disabled={
                                    safeCurrentPage ===
                                    1
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (
                                            previous
                                        ) =>
                                            Math.max(
                                                1,
                                                previous -
                                                1
                                            )
                                    )
                                }
                            >
                                Previous
                            </button>

                            <span
                                style={{
                                    fontSize:
                                        '14px',
                                    fontWeight:
                                        500,
                                }}
                            >
                                Page{' '}
                                {
                                    safeCurrentPage
                                }{' '}
                                of{' '}
                                {totalPages}
                            </span>

                            <button
                                type="button"
                                className="secondary-button"
                                disabled={
                                    safeCurrentPage ===
                                    totalPages
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (
                                            previous
                                        ) =>
                                            Math.min(
                                                totalPages,
                                                previous +
                                                1
                                            )
                                    )
                                }
                            >
                                Next
                            </button>

                        </div>

                    </div>
                )}

            </div>

            {/* CREATE CHALLAN */}
            {showForm && (
                <div className="modal-overlay">

                    <div className="modal-card">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    Create Sales Challan
                                </h2>

                                <p>
                                    New challans are
                                    created as Draft.
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

                                <div className="form-field">

                                    <label>
                                        Challan Number *
                                    </label>

                                    <input
                                        value={
                                            challanNumber
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setChallanNumber(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                    />

                                </div>

                                <div className="form-field">

                                    <label>
                                        Customer *
                                    </label>

                                    <select
                                        value={
                                            customerId
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCustomerId(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select customer
                                        </option>

                                        {customers.map(
                                            (
                                                customer
                                            ) => (
                                                <option
                                                    key={
                                                        customer.id
                                                    }
                                                    value={
                                                        customer.id
                                                    }
                                                >
                                                    {
                                                        customer.customer_name
                                                    }

                                                    {customer.business_name
                                                        ? ` — ${customer.business_name}`
                                                        : ''}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                            <h3
                                style={{
                                    marginTop:
                                        '20px',
                                }}
                            >
                                Items
                            </h3>

                            {items.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const selectedProduct =
                                        products.find(
                                            (
                                                product
                                            ) =>
                                                product.id ===
                                                item.product_id
                                        );

                                    return (
                                        <div
                                            key={
                                                index
                                            }
                                            style={{
                                                display:
                                                    'grid',
                                                gridTemplateColumns:
                                                    '1fr 120px auto',
                                                gap:
                                                    '10px',
                                                marginBottom:
                                                    '10px',
                                            }}
                                        >

                                            <select
                                                value={
                                                    item.product_id
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateItem(
                                                        index,
                                                        'product_id',
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select product
                                                </option>

                                                {products.map(
                                                    (
                                                        product
                                                    ) => (
                                                        <option
                                                            key={
                                                                product.id
                                                            }
                                                            value={
                                                                product.id
                                                            }
                                                        >
                                                            {
                                                                product.product_name
                                                            }{' '}
                                                            —{' '}
                                                            {
                                                                product.sku
                                                            }{' '}
                                                            (Stock:{' '}
                                                            {
                                                                product.current_stock
                                                            }
                                                            )
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder="Qty"
                                                value={
                                                    item.quantity
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                required
                                            />

                                            <button
                                                type="button"
                                                className="icon-button danger"
                                                onClick={() =>
                                                    removeItem(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    items.length ===
                                                    1
                                                }
                                            >
                                                🗑️
                                            </button>

                                            {selectedProduct &&
                                                Number(
                                                    item.quantity
                                                ) >
                                                selectedProduct.current_stock && (
                                                    <div
                                                        style={{
                                                            gridColumn:
                                                                '1 / -1',
                                                            color:
                                                                '#dc2626',
                                                            fontSize:
                                                                '12px',
                                                        }}
                                                    >
                                                        ⚠️ Requested
                                                        quantity
                                                        exceeds
                                                        current
                                                        stock.
                                                    </div>
                                                )}

                                        </div>
                                    );
                                }
                            )}

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    addItem
                                }
                            >
                                + Add Item
                            </button>

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
                                        ? 'Creating...'
                                        : 'Create Draft'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* DETAILS */}
            {showDetails &&
                selectedChallan && (
                    <div className="modal-overlay">

                        <div className="modal-card">

                            <div className="modal-header">

                                <div>
                                    <h2>
                                        {
                                            selectedChallan.challan_number
                                        }
                                    </h2>

                                    <p>
                                        Challan details
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={() =>
                                        setShowDetails(
                                            false
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div
                                style={{
                                    padding:
                                        '24px',
                                }}
                            >

                                <p>
                                    <strong>
                                        Customer:
                                    </strong>{' '}
                                    {
                                        selectedChallan.customer_name ||
                                        selectedChallan.customer_id
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{' '}
                                    {
                                        selectedChallan.status
                                    }
                                </p>

                                <p>
                                    <strong>
                                        Total Quantity:
                                    </strong>{' '}
                                    {
                                        selectedChallan.total_quantity
                                    }
                                </p>

                                {selectedChallan.items &&
                                    selectedChallan
                                        .items
                                        .length >
                                    0 && (
                                        <table
                                            className="data-table"
                                            style={{
                                                marginTop:
                                                    '20px',
                                            }}
                                        >

                                            <thead>
                                                <tr>

                                                    <th>
                                                        Product
                                                    </th>

                                                    <th>
                                                        SKU
                                                    </th>

                                                    <th>
                                                        Qty
                                                    </th>

                                                    <th>
                                                        Price
                                                    </th>

                                                </tr>
                                            </thead>

                                            <tbody>

                                                {selectedChallan.items.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                item.id ||
                                                                index
                                                            }
                                                        >

                                                            <td>
                                                                {
                                                                    item.product_name
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    item.sku
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    item.quantity
                                                                }
                                                            </td>

                                                            <td>
                                                                ₹
                                                                {Number(
                                                                    item.unit_price
                                                                ).toLocaleString(
                                                                    'en-IN'
                                                                )}
                                                            </td>

                                                        </tr>
                                                    )
                                                )}

                                            </tbody>

                                        </table>
                                    )}

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowDetails(
                                            false
                                        )
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default SalesChallans;