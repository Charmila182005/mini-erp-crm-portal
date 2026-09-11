export type CustomerType =
    | 'Retailer'
    | 'Distributor'
    | 'Wholesaler'
    | 'Other';

export type CustomerStatus =
    | 'Active'
    | 'Inactive';

export interface Customer {
    id: string;
    customer_name: string;
    mobile_number: string;
    email: string | null;
    business_name: string | null;
    gst_number: string | null;
    customer_type: CustomerType;
    address: string | null;
    status: CustomerStatus;
    follow_up_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CustomerFormData {
    customer_name: string;
    mobile_number: string;
    email: string;
    business_name: string;
    gst_number: string;
    customer_type: CustomerType;
    address: string;
    status: CustomerStatus;
    follow_up_date: string;
    notes: string;
}

export interface FollowUp {
    id: string;
    customer_id: string;
    note: string;
    follow_up_date: string;
    created_by: string;
    created_at: string;
    created_by_name?: string;
}