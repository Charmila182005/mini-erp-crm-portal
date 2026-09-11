export interface FollowUp {
    id: string;
    customer_id: string;
    note: string;
    follow_up_date: string;
    created_by: string;
    created_at: string;
    created_by_name?: string;
}

export interface FollowUpFormData {
    note: string;
    follow_up_date: string;
}