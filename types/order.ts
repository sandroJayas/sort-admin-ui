// types/sort.ts

// ==================== TYPE ALIASES ====================

// UUID string type for better code documentation
export type UUID = string;

// ISO date string
export type ISODateString = string;

// Type validation functions
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isValidISODateString(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
}

// ==================== ENUMS ====================

export enum OrderType {
  SELF_DROPOFF = "self_dropoff",
  READY_FOR_PICKUP = "ready_for_pickup",
  BOX_PROVIDED = "box_provided",
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  IN_FULFILLMENT = "in_fulfillment",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum BoxStatus {
  IN_TRANSIT = "in_transit",
  PENDING_PACK = "pending_pack",
  PENDING_PICKUP = "pending_pickup",
  AWAITING_INTAKE = "awaiting_intake",
  STORED = "stored",
  RETURNED = "returned",
  DISPOSED = "disposed",
}

export enum OperationType {
  APPROVAL = "approval",
  REJECTION = "rejection",
  SHIPMENT = "shipment",
  PICKUP = "pickup",
  DROPOFF = "dropoff",
  INTAKE = "intake",
  BOX_RETURN = "box_return",
  RELOCATE = "relocate",
}

export enum OperationContext {
  SELF_DROPOFF = "self_dropoff",
  READY_FOR_PICKUP = "ready_for_pickup",
  BOX_PROVIDED = "box_provided",
  RETURN = "return",
  INTERNAL = "internal",
}

export enum OperationStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// ==================== COMMON TYPES ====================

export interface Address {
  street: string;
  zip_code: string;
  city: string;
  country: string;
}

export interface Dimensions {
  height: number; // in cm
  width: number; // in cm
  length: number; // in cm
}

// Validation error detail structure
export interface ValidationError {
  field: string;
  message: string;
  value?: string | number | boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string> | ValidationError[];
}

export interface SuccessResponse {
  message: string;
}

export interface IDResponse {
  id: UUID;
}

export interface BatchIDResponse {
  ids: UUID[];
}

// ==================== ORDER TYPES ====================

export interface CreateOrderRequest {
  order_type: OrderType;
  box_count: number; // 1-10
  photo_urls?: string[]; // Required for self_dropoff and ready_for_pickup
  scheduled_date?: string; // ISO date string, required for self_dropoff
  address: Address;
  notes?: string; // max 500 chars

  // Extra data for specific order types
  slot_id?: string; // Required for self_dropoff
  boxes_requested?: number; // Required for box_provided (1-10)
}

// Type for order extra data based on order type
export type OrderExtraData = {
  slot_id?: UUID;
  boxes_requested?: number;
  pickup_scheduled?: boolean;
  shipment_tracking?: string;
  [key: string]: string | number | boolean | undefined;
};

export interface OrdersResponse {
  orders: OrderListResponse[];
  total: number;
  user_id: string;
}

export interface OrderResponse {
  id: string;
  user_id: string;
  order_type: string;
  status: string;
  box_count: number;
  photo_urls: string[];
  scheduled_date?: string;
  address: Address;
  notes?: string;
  extra_data?: OrderExtraData;
  boxes: BoxSummary[];
  operations: OperationSummary[];
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  id: string;
  order_type: string;
  status: string;
  box_count: number;
  photo_urls: string[];
  scheduled_date?: string;
  created_at: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  scheduled_date?: string;
  address?: Address;
  notes?: string;
  photo_urls?: string[];
}

export interface AdminApproveOrderRequest {
  notes?: string;
  scheduled_date?: string;
}

export interface AdminRejectOrderRequest {
  reason: string;
}

export interface BoxSummary {
  id: string;
  status: string;
  name?: string;
}

export interface OperationSummary {
  id: string;
  operation_type: string;
  status: string;
  scheduled_date?: string;
}

// ==================== BOX TYPES ====================

export interface BoxResponse {
  id: UUID;
  order_id: UUID;
  user_id: UUID;
  status: string;
  name?: string;
  description?: string;
  dimensions?: Dimensions; // User-provided
  verified_dimensions?: Dimensions; // Admin-verified
  weight?: number; // in kg
  location?: LocationInfo;
  operations?: OperationInfo[];
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface BoxListResponse {
  id: UUID;
  order_id: UUID;
  status: string;
  name?: string;
  location?: string;
  is_stored: boolean;
  created_at: ISODateString;
}

export interface UpdateBoxRequest {
  name?: string; // max 100 chars
  description?: string; // max 500 chars
  dimensions?: Dimensions;
}

export interface AdminUpdateBoxRequest {
  status?: BoxStatus;
  verified_dimensions?: Dimensions;
  weight?: number;
  location_id?: UUID;
}

export interface IntakeBoxRequest {
  verified_dimensions: Dimensions;
  weight: number;
  location_id: UUID;
  notes?: string;
}

export interface BatchIntakeRequest {
  boxes: IntakeBoxRequest[];
}

export interface LocationInfo {
  id: UUID;
  name: string;
  address: string;
}

export interface OperationInfo {
  id: UUID;
  operation_type: string;
  status: string;
  scheduled_date?: ISODateString;
  completed_date?: ISODateString;
}

export interface RequestBoxReturnRequest {
  box_ids: UUID[];
  delivery_address: Address;
  notes?: string;
}

// ==================== OPERATION TYPES ====================

export interface CreateOperationRequest {
  order_id?: UUID;
  box_id?: UUID;
  operation_type: OperationType;
  context: OperationContext;
  scheduled_date?: ISODateString;
  notes?: string;
}

export interface OperationResponse {
  id: UUID;
  order_id?: UUID;
  box_id?: UUID;
  user_id: UUID;
  operation_type: string;
  context: string;
  scheduled_date?: ISODateString;
  completed_date?: ISODateString;
  status: string;
  notes?: string;
  order?: OrderInfo;
  box?: BoxInfo;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface OperationListResponse {
  id: UUID;
  operation_type: string;
  context: string;
  status: string;
  scheduled_date?: ISODateString;
  completed_date?: ISODateString;
  created_at: ISODateString;
}

export interface UpdateOperationRequest {
  status?: OperationStatus;
  scheduled_date?: ISODateString;
  notes?: string;
}

export interface CompleteOperationRequest {
  completed_date: ISODateString;
  notes?: string;
}

export interface OrderInfo {
  id: UUID;
  order_type: string;
  status: string;
}

export interface BoxInfo {
  id: UUID;
  name?: string;
  status: string;
}

export interface SchedulePickupRequest {
  order_id: UUID;
  scheduled_date: ISODateString;
  notes?: string;
}

export interface ScheduleDropoffRequest {
  order_id: UUID;
  slot_id: UUID;
  notes?: string;
}

export interface ScheduleReturnRequest {
  box_ids: UUID[];
  scheduled_date: ISODateString;
  address: Address;
  notes?: string;
}

// ==================== PHOTO TYPES ====================

export interface PhotoUploadRequest {
  photos: string[]; // URLs
}

export interface PhotoUploadResponse {
  urls: string[];
  uploaded_at: ISODateString;
}

// ==================== STATISTICS TYPES ====================

export interface StorageStats {
  total_orders: number;
  active_orders: number;
  total_boxes: number;
  stored_boxes: number;
  boxes_by_status: Record<string, number>;
  orders_by_type: Record<string, number>;
  orders_by_status: Record<string, number>;
  pending_operations: number;
  completed_operations: number;
  storage_locations: LocationUtilization[];
}

export interface LocationUtilization {
  location_id: UUID;
  location_name: string;
  box_count: number;
  utilization_rate: number;
}

// ==================== FILTER TYPES ====================

// Generic filter request that can be specialized
export interface BaseFilterRequest {
  start_date?: ISODateString;
  end_date?: ISODateString;
  page?: number;
  limit?: number;
}

export interface OrderFilterRequest extends BaseFilterRequest {
  status?: OrderStatus;
  order_type?: OrderType;
}

export interface BoxFilterRequest extends BaseFilterRequest {
  status?: BoxStatus;
  order_id?: UUID;
}

export interface OperationFilterRequest extends BaseFilterRequest {
  status?: OperationStatus;
  context?: OperationContext;
  operation_type?: OperationType;
}

// Legacy filter type for backward compatibility
export interface FilterRequest extends BaseFilterRequest {
  status?: string;
  context?: string;
}

export interface DateRangeRequest {
  start_date: ISODateString;
  end_date: ISODateString;
}

// ==================== SLOT TYPES ====================

export interface Slot {
  id: UUID;
  type: "dropoff" | "pickup" | "return";
  start_time: ISODateString;
  end_time: ISODateString;
  capacity: number;
  available_capacity: number;
  is_available: boolean;
}

// ==================== API RESPONSE WRAPPER ====================

// Discriminated union for API responses
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ==================== UTILITY TYPES ====================

// For form validation
export type OrderFormData = Omit<CreateOrderRequest, "scheduled_date"> & {
  scheduled_date?: Date;
};

// For type guards
export function isOrderType(value: string): value is OrderType {
  return Object.values(OrderType).includes(value as OrderType);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return Object.values(OrderStatus).includes(value as OrderStatus);
}

export function isBoxStatus(value: string): value is BoxStatus {
  return Object.values(BoxStatus).includes(value as BoxStatus);
}

// Helper function for API response handling
export function isApiSuccess<T>(
  response: ApiResponse<T>,
): response is { success: true; data: T } {
  return response.success === true;
}

// Safe enum converters
export function toOrderType(value: string): OrderType | undefined {
  return isOrderType(value) ? value : undefined;
}

export function toOrderStatus(value: string): OrderStatus | undefined {
  return isOrderStatus(value) ? value : undefined;
}

export function toBoxStatus(value: string): BoxStatus | undefined {
  return isBoxStatus(value) ? value : undefined;
}

// Date conversion utilities
export function toISODateString(date: Date | string): ISODateString {
  if (typeof date === "string") {
    // Try to parse and convert to ISO format
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date string: ${date}`);
    }
    return parsed.toISOString();
  }
  return date.toISOString();
}

export function fromISODateString(dateString: ISODateString): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: ${dateString}`);
  }
  return date;
}

// Example usage:
// const response = await createOrder(orderData);
// if (isApiSuccess(response)) {
//   console.log(response.data); // TypeScript knows data exists
//   const orderType = toOrderType(response.data.order_type); // Safely convert to enum
//   const createdDate = fromISODateString(response.data.created_at); // Convert to Date object
// } else {
//   console.error(response.error); // TypeScript knows error exists
// }

// ==================== API HELPERS ====================

// Type-safe API request function
export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      return { success: false, error };
    }

    const data: T = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: {
        error: "network_error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}
