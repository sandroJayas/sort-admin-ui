// Storage Location Types for Next.js Frontend

// Base request to create a storage location
export interface CreateStorageLocationRequest {
  name: string; // required, max 100 chars
  address: string; // required
  capacity: number; // required, min 1
}

// Main storage location type (response from API)
export interface StorageLocation {
  id: string; // UUID
  name: string;
  address: string;
  capacity: number;
  current_load: number;
  available_space: number;
  utilization_rate: number; // Percentage 0-100
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// List response for multiple storage locations
export interface StorageLocationListResponse {
  locations: StorageLocation[];
  total: number;
}

// Update request (all fields optional)
export interface UpdateStorageLocationRequest {
  name?: string; // optional, max 100 chars
  address?: string;
  capacity?: number; // optional, min 1
}

// Statistics response for a storage location
export interface StorageLocationStats {
  id: string; // UUID
  name: string;
  total_boxes: number;
  boxes_by_status: Record<string, number>; // e.g., { "stored": 10, "in_transit": 5 }
  utilization_rate: number; // Percentage 0-100
  average_storage_days: number;
  incoming_operations: number;
  outgoing_operations: number;
}

// Request to transfer boxes between locations
export interface TransferBoxesRequest {
  box_ids: string[]; // Array of UUIDs, required, min 1
  target_location_id: string; // UUID, required
  reason: string; // required
  scheduled_date: string; // ISO date string, required
}

// Helper type for box status (based on your system description)
export type BoxStatus =
  | 'in_transit'
  | 'pending_pack'
  | 'pending_pickup'
  | 'stored'
  | 'returned'
  | 'disposed';

// Helper type for available capacity filtering
export interface AvailableLocationsParams {
  capacity?: number; // Optional capacity requirement (default: 1)
}

// Utility type for API error responses (common pattern)
export interface ErrorResponse {
  error: string;
  message: string;
  field?: string; // Optional field that caused the error
}

// Utility type for success responses
export interface SuccessResponse {
  message: string;
}

// Helper function to format utilization rate for display
export function formatUtilizationRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

// Helper function to format date strings for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

// Helper function to format date and time for display
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString();
}