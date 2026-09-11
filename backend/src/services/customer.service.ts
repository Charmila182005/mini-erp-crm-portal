import { query } from '../config/database';

export const getAllCustomers = async () => {
    const result = await query(
        `
      SELECT
        id,
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes,
        created_at,
        updated_at
      FROM customers
      ORDER BY created_at DESC
    `
    );

    return result.rows;
};

export const getCustomerById = async (id: string) => {
    const result = await query(
        `
      SELECT
        id,
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes,
        created_at,
        updated_at
      FROM customers
      WHERE id = $1
      LIMIT 1
    `,
        [id]
    );

    return result.rows[0] || null;
};
export const createCustomer = async (customer: {
    customer_name: string;
    mobile_number: string;
    email: string;
    business_name?: string | null;
    gst_number?: string | null;
    customer_type: string;
    address: string;
    status: string;
    follow_up_date?: string | null;
    notes?: string | null;
}) => {
    const result = await query(
        `
      INSERT INTO customers (
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes,
        created_at,
        updated_at
    `,
        [
            customer.customer_name,
            customer.mobile_number,
            customer.email,
            customer.business_name ?? null,
            customer.gst_number ?? null,
            customer.customer_type,
            customer.address,
            customer.status,
            customer.follow_up_date ?? null,
            customer.notes ?? null,
        ]
    );

    return result.rows[0];
};
export const updateCustomer = async (
    id: string,
    customer: {
        customer_name: string;
        mobile_number: string;
        email: string;
        business_name?: string | null;
        gst_number?: string | null;
        customer_type: string;
        address: string;
        status: string;
        follow_up_date?: string | null;
        notes?: string | null;
    }
) => {
    const result = await query(
        `
        UPDATE customers
        SET
            customer_name = $1,
            mobile_number = $2,
            email = $3,
            business_name = $4,
            gst_number = $5,
            customer_type = $6,
            address = $7,
            status = $8,
            follow_up_date = $9,
            notes = $10,
            updated_at = NOW()
        WHERE id = $11
        RETURNING
            id,
            customer_name,
            mobile_number,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes,
            created_at,
            updated_at
        `,
        [
            customer.customer_name,
            customer.mobile_number,
            customer.email,
            customer.business_name ?? null,
            customer.gst_number ?? null,
            customer.customer_type,
            customer.address,
            customer.status,
            customer.follow_up_date ?? null,
            customer.notes ?? null,
            id,
        ]
    );

    return result.rows[0] || null;
};
export const deleteCustomer = async (id: string) => {
    const result = await query(
        `
        DELETE FROM customers
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows[0] || null;
};