export interface Dimensions {
  height: number;
  width: number;
  length: number;
}

export interface IntakeBoxRequest {
  verified_dimensions: Dimensions;
  weight: number;
  location_id: string;
  notes?: string;
}

export interface BatchIntakeRequest {
  boxes: IntakeBoxRequest[];
}

export interface SuccessResponse {
  message: string;
}

export interface BatchIntakePayload {
  orderId: string;
  data: BatchIntakeRequest;
}

export interface ValidationError {
  boxIndex: number;
  field: string;
  message: string;
}

export interface IntakeModalProps {
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export type DimensionField = keyof Dimensions;
export type BoxField = keyof Omit<IntakeBoxRequest, "verified_dimensions">;
