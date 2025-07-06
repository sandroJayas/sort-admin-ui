// Order-related type definitions
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Dimensions {
  height: number;
  length: number;
  width: number;
}

export interface Item {
  id: string;
  boxId: string;
  name: string;
  description?: string;
  quantity: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Box {
  id: string;
  orderId: string;
  userId: string;
  status:
    | "in_transit"
    | "pending_pack"
    | "pending_pickup"
    | "stored"
    | "returned"
    | "disposed";
  name?: string;
  description?: string;
  dimensions?: Dimensions;
  weight?: number;
  locationId?: string;
  items?: Item[];
  photoUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  orderType: "ready_for_pickup" | "box_provided" | "packed_by_sort";
  status: "pending" | "processing" | "completed" | "cancelled";
  totalBoxes: number;
  pickupAddress: Address;
  deliveryAddress?: Address;
  scheduledDate?: string;
  notes?: string;
  boxes?: Box[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  orderType: "ready_for_pickup" | "box_provided" | "packed_by_sort";
  quantity: number;
  pickupAddress: Address;
  deliveryAddress?: Address;
  scheduledDate?: string;
  notes?: string;
  boxes?: Array<{
    name: string;
    dimensions: Dimensions;
    photoUrls?: string[];
  }>;
}

export interface UpdateScheduleRequest {
  scheduledDate: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface FilterParams {
  status?: string;
  orderType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  field?: string;
  details?: Record<string, string>;
}
