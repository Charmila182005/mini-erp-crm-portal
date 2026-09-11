import { query } from '../config/database';

export const getCustomerFollowups = async (customerId: string) => {
    const result = await query(
        `
        SELECT
            cf.id,
            cf.customer_id,
            cf.follow_up_date,
            cf.note,
            cf.created_by,
            u.name AS created_by_name,
            cf.created_at
        FROM customer_followups cf
        JOIN users u ON u.id = cf.created_by
        WHERE cf.customer_id = $1
        ORDER BY cf.follow_up_date DESC, cf.created_at DESC
        `,
        [customerId]
    );

    return result.rows;
};

export const createFollowup = async (
    customerId: string,
    followUpDate: string,
    note: string,
    createdBy: string
) => {
    const result = await query(
        `
        INSERT INTO customer_followups (
            customer_id,
            follow_up_date,
            note,
            created_by
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            customer_id,
            follow_up_date,
            note,
            created_by,
            created_at
        `,
        [customerId, followUpDate, note, createdBy]
    );

    return result.rows[0];
};

export const updateFollowup = async (
    id: string,
    followUpDate: string,
    note: string
) => {
    const result = await query(
        `
        UPDATE customer_followups
        SET
            follow_up_date = $1,
            note = $2
        WHERE id = $3
        RETURNING
            id,
            customer_id,
            follow_up_date,
            note,
            created_by,
            created_at
        `,
        [followUpDate, note, id]
    );

    return result.rows[0] || null;
};

export const deleteFollowup = async (id: string) => {
    const result = await query(
        `
        DELETE FROM customer_followups
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows[0] || null;
};