export interface ServiceResponse<T> {
    data: T;
    pagination?: PaginationResponse;
    message?: string;
}

export interface PaginationResponse {
    limit: number;
    page: number;
    totalPages: number;
    total: number;
}