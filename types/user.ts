/**
 * User response type matching the backend UserResponse DTO
 */
export interface User {
  id: string; // UUID as string
  auth0_sub: string;
  email: string;
  account_type: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
  email_verified: boolean;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Paginated users response matching the backend PaginatedUsersResponse DTO
 */
export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Profile update request type (based on the UpdateProfileRequest DTO reference)
 */
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone_number?: string;
}

/**
 * Common response types based on common.go
 */
export interface ErrorResponse {
  error: string;
  message: string;
  field?: string;
  details?: Record<string, string>;
}

export interface SuccessResponse<T = unknown> {
  message: string;
  data?: T;
}

/**
 * User-specific response wrappers
 */
export interface UserMeResponse {
  user: User;
}

export interface UserUpdateResponse {
  user: User;
}

/**
 * Type guard utility for safer property checking
 */
const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
): obj is T & Record<K, unknown> => {
  return key in obj;
};

/**
 * Type guards for runtime type checking
 */
export const isUser = (obj: unknown): obj is User => {
  if (typeof obj !== "object" || obj === null) return false;

  const candidate = obj as Record<string, unknown>;

  return (
    hasProperty(candidate, "id") &&
    hasProperty(candidate, "auth0_sub") &&
    hasProperty(candidate, "email") &&
    hasProperty(candidate, "account_type") &&
    hasProperty(candidate, "email_verified") &&
    typeof candidate.id === "string" &&
    typeof candidate.auth0_sub === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.account_type === "string" &&
    (candidate.account_type === "admin" ||
      candidate.account_type === "regular") &&
    typeof candidate.email_verified === "boolean"
  );
};

export const isPaginatedUsersResponse = (
  obj: unknown,
): obj is PaginatedUsersResponse => {
  if (typeof obj !== "object" || obj === null) return false;

  const candidate = obj as Record<string, unknown>;

  return (
    hasProperty(candidate, "users") &&
    hasProperty(candidate, "total") &&
    hasProperty(candidate, "page") &&
    hasProperty(candidate, "limit") &&
    hasProperty(candidate, "total_pages") &&
    Array.isArray(candidate.users) &&
    typeof candidate.total === "number" &&
    typeof candidate.page === "number" &&
    typeof candidate.limit === "number" &&
    typeof candidate.total_pages === "number"
  );
};

/**
 * Extended user type with computed properties for frontend use
 */
export interface UserWithComputedProps extends User {
  fullName: string;
  fullAddress: string;
  isAdmin: boolean;
}

/**
 * Helper function to create UserWithComputedProps
 */
export const enhanceUser = (user: User): UserWithComputedProps => {
  return {
    ...user,
    fullName: `${user.first_name} ${user.last_name}`.trim(),
    fullAddress: [
      user.address_line_1,
      user.address_line_2,
      user.city,
      user.postal_code,
      user.country,
    ]
      .filter(Boolean)
      .join(", "),
    isAdmin: user.account_type === "admin",
  };
};

/**
 * Type-safe error handling utilities
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public field?: string,
    public details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
