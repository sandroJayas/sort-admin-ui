// types/operations.ts

// Enums for operation types, contexts, and statuses
export enum OperationType {
  Approval = "approval",
  Rejection = "rejection",
  Shipment = "shipment",
  Pickup = "pickup",
  Dropoff = "dropoff",
  Intake = "intake",
  BoxReturn = "box_return",
  Relocate = "relocate",
}

export enum OperationContext {
  SelfDropoff = "self_dropoff",
  ReadyForPickup = "ready_for_pickup",
  BoxProvided = "box_provided",
  Return = "return",
  Internal = "internal",
}

export enum OperationStatus {
  Scheduled = "scheduled",
  InProgress = "in_progress",
  Completed = "completed",
  Cancelled = "cancelled",
}

// Common interfaces
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

// Operation related info interfaces
export interface OrderInfo {
  id: string;
  order_type: string;
  status: string;
}

export interface BoxInfo {
  id: string;
  name?: string;
  status: string;
}

// Request interfaces
export interface CreateOperationRequest {
  order_id?: string;
  box_id?: string;
  operation_type: OperationType;
  context: OperationContext;
  scheduled_date?: Date | string;
  notes?: string;
}

export interface UpdateOperationRequest {
  status?: OperationStatus;
  scheduled_date?: Date | string;
  notes?: string;
}

export interface CompleteOperationRequest {
  completed_date: Date | string;
  notes?: string;
}

export interface SchedulePickupRequest {
  order_id: string;
  scheduled_date: Date | string;
  notes?: string;
}

export interface ScheduleDropoffRequest {
  order_id: string;
  slot_id: string;
  notes?: string;
}

export interface ScheduleReturnRequest {
  box_ids: string[];
  scheduled_date: Date | string;
  address: Address;
  notes?: string;
}

// Response interfaces
export interface OperationResponse {
  id: string;
  order_id?: string;
  box_id?: string;
  user_id: string;
  operation_type: string;
  context: string;
  scheduled_date?: Date | string;
  completed_date?: Date | string;
  status: string;
  notes?: string;
  order?: OrderInfo; // If preloaded
  box?: BoxInfo; // If preloaded
  created_at: Date | string;
  updated_at: Date | string;
}

export interface OperationListResponse {
  id: string;
  operation_type: string;
  context: string;
  status: string;
  scheduled_date?: Date | string;
  completed_date?: Date | string;
  created_at: Date | string;
}

// Filter interfaces
export interface OperationFilterRequest {
  status?: string;
  context?: string;
  operation_type?: string;
  start_date?: Date | string;
  end_date?: Date | string;
}

// Admin specific request interfaces
export interface AdminApproveOrderRequest {
  notes?: string;
  scheduled_date?: Date | string;
}

export interface AdminRejectOrderRequest {
  reason: string;
}

// Response wrappers
export interface OperationListApiResponse {
  operations: OperationListResponse[];
}

export interface BatchOperationResponse {
  ids: string[];
}

// Helper type for operation type validation
export const isValidOperationType = (type: string): type is OperationType => {
  return Object.values(OperationType).includes(type as OperationType);
};

// Helper type for operation context validation
export const isValidOperationContext = (
  context: string,
): context is OperationContext => {
  return Object.values(OperationContext).includes(context as OperationContext);
};

// Helper type for operation status validation
export const isValidOperationStatus = (
  status: string,
): status is OperationStatus => {
  return Object.values(OperationStatus).includes(status as OperationStatus);
};

// Type guards
export const isOperationScheduled = (
  operation: OperationResponse | OperationListResponse,
): boolean => {
  return operation.status === OperationStatus.Scheduled;
};

export const isOperationCompleted = (
  operation: OperationResponse | OperationListResponse,
): boolean => {
  return operation.status === OperationStatus.Completed;
};

export const isOperationCancellable = (
  operation: OperationResponse | OperationListResponse,
): boolean => {
  return operation.status === OperationStatus.Scheduled;
};

// Operation type categorization helpers
export const isLogisticsOperation = (type: OperationType): boolean => {
  return [
    OperationType.Pickup,
    OperationType.Dropoff,
    OperationType.BoxReturn,
    OperationType.Shipment,
    OperationType.Relocate,
  ].includes(type);
};

export const isAdminOperation = (type: OperationType): boolean => {
  return [
    OperationType.Approval,
    OperationType.Rejection,
    OperationType.Intake,
    OperationType.Relocate,
  ].includes(type);
};

// Context helpers
export const getOperationContextLabel = (context: OperationContext): string => {
  const labels: Record<OperationContext, string> = {
    [OperationContext.SelfDropoff]: "Self Drop-off",
    [OperationContext.ReadyForPickup]: "Ready for Pickup",
    [OperationContext.BoxProvided]: "Box Provided",
    [OperationContext.Return]: "Return",
    [OperationContext.Internal]: "Internal",
  };
  return labels[context] || context;
};

export const getOperationTypeLabel = (type: OperationType): string => {
  const labels: Record<OperationType, string> = {
    [OperationType.Approval]: "Approval",
    [OperationType.Rejection]: "Rejection",
    [OperationType.Shipment]: "Shipment",
    [OperationType.Pickup]: "Pickup",
    [OperationType.Dropoff]: "Drop-off",
    [OperationType.Intake]: "Intake",
    [OperationType.BoxReturn]: "Box Return",
    [OperationType.Relocate]: "Relocate",
  };
  return labels[type] || type;
};

export const getOperationStatusLabel = (status: OperationStatus): string => {
  const labels: Record<OperationStatus, string> = {
    [OperationStatus.Scheduled]: "Scheduled",
    [OperationStatus.InProgress]: "In Progress",
    [OperationStatus.Completed]: "Completed",
    [OperationStatus.Cancelled]: "Cancelled",
  };
  return labels[status] || status;
};

// Status color helpers for UI
export const getOperationStatusColor = (status: OperationStatus): string => {
  const colors: Record<OperationStatus, string> = {
    [OperationStatus.Scheduled]: "blue",
    [OperationStatus.InProgress]: "yellow",
    [OperationStatus.Completed]: "green",
    [OperationStatus.Cancelled]: "gray",
  };
  return colors[status] || "gray";
};
