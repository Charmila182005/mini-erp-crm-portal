import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';

import { useAuth } from '../context/AuthContext';

import {
    createCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomer,
} from '../services/customer.service';

import {
    createFollowUp,
    deleteFollowUp,
    getFollowUps,
    updateFollowUp,
} from '../services/followup.service';

import type {
    FollowUp,
    FollowUpFormData,
} from '../types/followup.types';

import type {
    Customer,
    CustomerFormData,
    CustomerType,
    CustomerStatus,
} from '../types/customer.types';

const emptyForm: CustomerFormData = {
    customer_name: '',
    mobile_number: '',
    email: '',
    business_name: '',
    gst_number: '',
    customer_type: 'Retailer',
    address: '',
    status: 'Active',
    follow_up_date: '',
    notes: '',
};

const emptyFollowUpForm: FollowUpFormData = {
    note: '',
    follow_up_date: '',
};

const Customers = () => {
    const { user } = useAuth();

    /* =========================
       CUSTOMER STATE
    ========================= */

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] =
        useState<Customer | null>(null);

    const [form, setForm] =
        useState<CustomerFormData>(emptyForm);

    const [isSaving, setIsSaving] = useState(false);

    /* =========================
       FOLLOW-UP STATE
    ========================= */

    const [showFollowUp, setShowFollowUp] = useState(false);

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [followUps, setFollowUps] =
        useState<FollowUp[]>([]);

    const [followUpLoading, setFollowUpLoading] =
        useState(false);

    const [followUpSaving, setFollowUpSaving] =
        useState(false);

    const [followUpError, setFollowUpError] =
        useState('');

    const [editingFollowUpId, setEditingFollowUpId] =
        useState<string | null>(null);

    const [followUpForm, setFollowUpForm] =
        useState<FollowUpFormData>(
            emptyFollowUpForm
        );

    /* =========================
       LOAD CUSTOMERS
    ========================= */

    const loadCustomers = async () => {
        try {
            setIsLoading(true);
            setError('');

            const data = await getCustomers();

            setCustomers(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load customers'
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    /* =========================
       SEARCH
    ========================= */

    const filteredCustomers = useMemo(() => {
        const value = search
            .trim()
            .toLowerCase();

        if (!value) {
            return customers;
        }

        return customers.filter((customer) =>
            [
                customer.customer_name,
                customer.mobile_number,
                customer.email,
                customer.business_name,
                customer.gst_number,
            ]
                .filter(Boolean)
                .some((field) =>
                    String(field)
                        .toLowerCase()
                        .includes(value)
                )
        );
    }, [customers, search]);

    /* =========================
       CUSTOMER FORM
    ========================= */

    const openCreateForm = () => {
        setEditingCustomer(null);
        setForm({ ...emptyForm });
        setShowForm(true);
        setError('');
    };

    const openEditForm = (customer: Customer) => {
        setEditingCustomer(customer);

        setForm({
            customer_name:
                customer.customer_name,

            mobile_number:
                customer.mobile_number,

            email:
                customer.email || '',

            business_name:
                customer.business_name || '',

            gst_number:
                customer.gst_number || '',

            customer_type:
                customer.customer_type,

            address:
                customer.address || '',

            status:
                customer.status,

            follow_up_date:
                customer.follow_up_date
                    ? customer.follow_up_date.slice(0, 10)
                    : '',

            notes:
                customer.notes || '',
        });

        setShowForm(true);
        setError('');
    };

    const handleFormChange = (
        field: keyof CustomerFormData,
        value: string
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setIsSaving(true);
            setError('');

            if (editingCustomer) {
                await updateCustomer(
                    editingCustomer.id,
                    form
                );
            } else {
                await createCustomer(form);
            }

            setShowForm(false);
            setEditingCustomer(null);
            setForm({ ...emptyForm });

            await loadCustomers();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to save customer'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (
        customer: Customer
    ) => {
        const confirmed =
            window.confirm(
                `Delete customer "${customer.customer_name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setError('');

            await deleteCustomer(
                customer.id
            );

            await loadCustomers();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete customer'
            );
        }
    };

    /* =========================
       FOLLOW-UP FUNCTIONS
    ========================= */

    const loadFollowUps = async (
        customerId: string
    ) => {
        try {
            setFollowUpLoading(true);
            setFollowUpError('');

            const data =
                await getFollowUps(
                    customerId
                );

            setFollowUps(data);
        } catch (err) {
            setFollowUpError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load follow-ups'
            );
        } finally {
            setFollowUpLoading(false);
        }
    };

    const openFollowUpModal = async (
        customer: Customer
    ) => {
        setSelectedCustomer(customer);

        setEditingFollowUpId(null);

        setFollowUpForm({
            ...emptyFollowUpForm,
        });

        setFollowUpError('');

        setShowFollowUp(true);

        await loadFollowUps(
            customer.id
        );
    };

    const handleFollowUpChange = (
        field: keyof FollowUpFormData,
        value: string
    ) => {
        setFollowUpForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleFollowUpSubmit = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!selectedCustomer) {
            return;
        }

        if (!followUpForm.note.trim()) {
            setFollowUpError(
                'Follow-up note is required.'
            );
            return;
        }

        if (!followUpForm.follow_up_date) {
            setFollowUpError(
                'Follow-up date is required.'
            );
            return;
        }

        try {
            setFollowUpSaving(true);
            setFollowUpError('');

            if (editingFollowUpId) {
                await updateFollowUp(
                    editingFollowUpId,
                    followUpForm
                );
            } else {
                await createFollowUp(
                    selectedCustomer.id,
                    followUpForm
                );
            }

            setEditingFollowUpId(null);

            setFollowUpForm({
                ...emptyFollowUpForm,
            });

            await loadFollowUps(
                selectedCustomer.id
            );
        } catch (err) {
            setFollowUpError(
                err instanceof Error
                    ? err.message
                    : 'Failed to save follow-up'
            );
        } finally {
            setFollowUpSaving(false);
        }
    };

    const handleEditFollowUp = (
        followUp: FollowUp
    ) => {
        setEditingFollowUpId(
            followUp.id
        );

        setFollowUpForm({
            note: followUp.note,

            follow_up_date:
                followUp.follow_up_date
                    ? followUp.follow_up_date.slice(
                        0,
                        10
                    )
                    : '',
        });

        setFollowUpError('');
    };

    const handleDeleteFollowUp = async (
        followUp: FollowUp
    ) => {
        const confirmed =
            window.confirm(
                'Delete this follow-up?'
            );

        if (!confirmed) {
            return;
        }

        try {
            setFollowUpError('');

            await deleteFollowUp(
                followUp.id
            );

            if (selectedCustomer) {
                await loadFollowUps(
                    selectedCustomer.id
                );
            }
        } catch (err) {
            setFollowUpError(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete follow-up'
            );
        }
    };

    const closeFollowUpModal = () => {
        setShowFollowUp(false);

        setSelectedCustomer(null);

        setFollowUps([]);

        setEditingFollowUpId(null);

        setFollowUpError('');

        setFollowUpForm({
            ...emptyFollowUpForm,
        });
    };

    /* =========================
       ROLE
    ========================= */

    const canManageCustomers =
        user?.role === 'ADMIN' ||
        user?.role === 'SALES';

    /* =========================
       UI
    ========================= */

    return (
        <div className="module-page">

            {/* HEADER */}

            <div className="module-header">

                <div>

                    <h1>
                        Customers & CRM
                    </h1>

                    <p>
                        Manage customers, business
                        details and follow-up
                        information.
                    </p>

                </div>

                {canManageCustomers && (
                    <button
                        className="primary-button"
                        onClick={
                            openCreateForm
                        }
                    >
                        + Add Customer
                    </button>
                )}

            </div>

            {/* ERROR */}

            {error && (
                <div className="module-error">
                    {error}
                </div>
            )}

            {/* SEARCH */}

            <div className="module-toolbar">

                <div className="search-box">

                    <span>🔎</span>

                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

                <div className="result-count">

                    {filteredCustomers.length}{' '}
                    customer
                    {filteredCustomers.length !==
                        1
                        ? 's'
                        : ''}

                </div>

            </div>

            {/* CUSTOMER TABLE */}

            <div className="data-card">

                {isLoading ? (

                    <div className="table-state">
                        Loading customers...
                    </div>

                ) : filteredCustomers.length ===
                    0 ? (

                    <div className="table-state">

                        <span>👥</span>

                        <strong>
                            No customers found
                        </strong>

                        <p>
                            Try another search or
                            add a new customer.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Business
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Follow-up
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredCustomers.map(
                                    (customer) => (

                                        <tr
                                            key={
                                                customer.id
                                            }
                                        >

                                            <td>

                                                <div className="customer-cell">

                                                    <div className="customer-avatar">

                                                        {customer.customer_name
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                customer.customer_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {customer.gst_number ||
                                                                'No GST'}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>
                                                {customer.business_name ||
                                                    '—'}
                                            </td>

                                            <td>

                                                <strong>
                                                    {
                                                        customer.mobile_number
                                                    }
                                                </strong>

                                                <span className="table-subtext">
                                                    {customer.email ||
                                                        'No email'}
                                                </span>

                                            </td>

                                            <td>

                                                <span className="type-badge">
                                                    {
                                                        customer.customer_type
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`status-badge ${customer.status ===
                                                            'Active'
                                                            ? 'status-active'
                                                            : 'status-inactive'
                                                        }`}
                                                >
                                                    {
                                                        customer.status
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                {customer.follow_up_date
                                                    ? new Date(
                                                        customer.follow_up_date
                                                    ).toLocaleDateString()
                                                    : '—'}

                                            </td>

                                            <td>

                                                <div className="table-actions">

                                                    <button
                                                        type="button"
                                                        className="icon-button"
                                                        title="Follow-ups"
                                                        onClick={() =>
                                                            openFollowUpModal(
                                                                customer
                                                            )
                                                        }
                                                    >
                                                        📅
                                                    </button>

                                                    {canManageCustomers && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="icon-button"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        customer
                                                                    )
                                                                }
                                                            >
                                                                ✏️
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="icon-button danger"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        customer
                                                                    )
                                                                }
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* CUSTOMER FORM MODAL */}

            {showForm && (

                <div className="modal-overlay">

                    <div className="modal-card">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {editingCustomer
                                        ? 'Edit Customer'
                                        : 'Add Customer'}
                                </h2>

                                <p>
                                    Enter the customer
                                    information below.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setShowForm(false)
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
                                        Customer Name *
                                    </label>

                                    <input
                                        value={
                                            form.customer_name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'customer_name',
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
                                        Mobile Number *
                                    </label>

                                    <input
                                        value={
                                            form.mobile_number
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'mobile_number',
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
                                        Business Name
                                    </label>

                                    <input
                                        value={
                                            form.business_name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'business_name',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                </div>

                                <div className="form-field">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'email',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                </div>

                                <div className="form-field">

                                    <label>
                                        GST Number
                                    </label>

                                    <input
                                        value={
                                            form.gst_number
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'gst_number',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                </div>

                                <div className="form-field">

                                    <label>
                                        Customer Type
                                    </label>

                                    <select
                                        value={
                                            form.customer_type
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'customer_type',
                                                event
                                                    .target
                                                    .value as CustomerType
                                            )
                                        }
                                    >

                                        <option value="Retailer">
                                            Retail
                                        </option>

                                        <option value="Distributor">
                                            Distributor
                                        </option>

                                        <option value="Wholesale">
                                            Wholesale
                                        </option>

                                    </select>

                                </div>

                                <div className="form-field">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={
                                            form.status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'status',
                                                event
                                                    .target
                                                    .value as CustomerStatus
                                            )
                                        }
                                    >

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                        <option value="Lead">
                                            Lead
                                        </option>

                                    </select>

                                </div>

                                <div className="form-field">

                                    <label>
                                        Follow-up Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            form.follow_up_date
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'follow_up_date',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                </div>

                                <div className="form-field full-width">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={
                                            form.address
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'address',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                </div>

                                <div className="form-field full-width">

                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={
                                            form.notes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                'notes',
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
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
                                        : editingCustomer
                                            ? 'Update Customer'
                                            : 'Create Customer'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* FOLLOW-UP MODAL */}

            {showFollowUp && (
                <div className="modal-overlay">

                    <div className="modal-card">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Customer Follow-ups
                                </h2>

                                <p>
                                    {selectedCustomer
                                        ? `Follow-up history for ${selectedCustomer.customer_name}`
                                        : ''}
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeFollowUpModal
                                }
                            >
                                ×
                            </button>

                        </div>

                        {followUpError && (
                            <div className="module-error">
                                {followUpError}
                            </div>
                        )}

                        {/* ADD / EDIT FOLLOW-UP */}

                        {canManageCustomers && (
                            <form
                                className="customer-form"
                                onSubmit={
                                    handleFollowUpSubmit
                                }
                            >

                                <div className="form-grid">

                                    <div className="form-field full-width">

                                        <label>
                                            Follow-up Note *
                                        </label>

                                        <textarea
                                            rows={3}
                                            placeholder="Enter follow-up details..."
                                            value={
                                                followUpForm.note
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleFollowUpChange(
                                                    'note',
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
                                            Follow-up Date *
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                followUpForm.follow_up_date
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleFollowUpChange(
                                                    'follow_up_date',
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                        />

                                    </div>

                                </div>

                                <div className="modal-footer">

                                    {editingFollowUpId && (
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() => {
                                                setEditingFollowUpId(
                                                    null
                                                );

                                                setFollowUpForm({
                                                    ...emptyFollowUpForm,
                                                });

                                                setFollowUpError(
                                                    ''
                                                );
                                            }}
                                        >
                                            Cancel Edit
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className="primary-button"
                                        disabled={
                                            followUpSaving
                                        }
                                    >
                                        {followUpSaving
                                            ? 'Saving...'
                                            : editingFollowUpId
                                                ? 'Update Follow-up'
                                                : 'Add Follow-up'}
                                    </button>

                                </div>

                            </form>
                        )}

                        {/* FOLLOW-UP HISTORY */}

                        <div
                            style={{
                                padding:
                                    '0 24px 24px',
                            }}
                        >

                            <h3>
                                Follow-up History
                            </h3>

                            {followUpLoading ? (

                                <div className="table-state">
                                    Loading follow-ups...
                                </div>

                            ) : followUps.length ===
                                0 ? (

                                <div className="table-state">

                                    <span>📅</span>

                                    <strong>
                                        No follow-ups yet
                                    </strong>

                                    {canManageCustomers && (
                                        <p>
                                            Add the first
                                            follow-up above.
                                        </p>
                                    )}

                                </div>

                            ) : (

                                <div>

                                    {followUps.map(
                                        (followUp) => (

                                            <div
                                                key={
                                                    followUp.id
                                                }
                                                style={{
                                                    border:
                                                        '1px solid #e5e7eb',
                                                    borderRadius:
                                                        '10px',
                                                    padding:
                                                        '14px',
                                                    marginBottom:
                                                        '10px',
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        gap:
                                                            '12px',
                                                    }}
                                                >

                                                    <div>

                                                        <strong>
                                                            {
                                                                followUp.note
                                                            }
                                                        </strong>

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    '6px',
                                                                fontSize:
                                                                    '13px',
                                                                color:
                                                                    '#6b7280',
                                                            }}
                                                        >
                                                            📅{' '}
                                                            {followUp.follow_up_date
                                                                ? new Date(
                                                                    followUp.follow_up_date
                                                                ).toLocaleDateString()
                                                                : 'No date'}
                                                        </div>

                                                    </div>

                                                    {canManageCustomers && (
                                                        <div className="table-actions">

                                                            <button
                                                                type="button"
                                                                className="icon-button"
                                                                title="Edit follow-up"
                                                                onClick={() =>
                                                                    handleEditFollowUp(
                                                                        followUp
                                                                    )
                                                                }
                                                            >
                                                                ✏️
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="icon-button danger"
                                                                title="Delete follow-up"
                                                                onClick={() =>
                                                                    handleDeleteFollowUp(
                                                                        followUp
                                                                    )
                                                                }
                                                            >
                                                                🗑️
                                                            </button>

                                                        </div>
                                                    )}

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    closeFollowUpModal
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

export default Customers;