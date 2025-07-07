// Slot Types for Sort Storage Service

// Enum for slot types
export enum SlotType {
  DROPOFF = "dropoff",
  PICKUP = "pickup",
  RETURN = "return",
}

// Weekday enum for batch slot creation
export enum Weekday {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

// Request to create a single slot
export interface CreateSlotRequest {
  slot_type: SlotType;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
  max_capacity: number;
}

// Request to create multiple slots in batch
export interface CreateBatchSlotsRequest {
  slot_type: SlotType;
  start_date: string; // ISO 8601 date
  end_date: string; // ISO 8601 date
  time_slots: string[]; // e.g., ["09:00-11:00", "11:00-13:00"]
  max_capacity: number;
  weekdays: Weekday[]; // Array of weekday numbers (0-6)
}

// Slot response object
export interface SlotResponse {
  id: string; // UUID
  slot_type: SlotType;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
  max_capacity: number;
  current_capacity: number;
  available_capacity: number;
  is_available: boolean;
}

// Request to get all slots
export interface AllSlotsRequest {
  start_date: string; // ISO 8601 date
  end_date: string; // ISO 8601 date
}

// Request to check slot availability
export interface SlotAvailabilityRequest {
  slot_type: SlotType;
  start_date: string; // ISO 8601 date
  end_date: string; // ISO 8601 date
}

// Response containing available slots
export interface SlotAvailabilityResponse {
  slots: SlotResponse[];
  total: number;
}

// Request to update slot (partial update)
export interface UpdateSlotRequest {
  max_capacity?: number;
}

// Request to reserve a slot
export interface ReserveSlotRequest {
  slot_id: string; // UUID
}

// Request to release a slot reservation
export interface ReleaseSlotRequest {
  slot_id: string; // UUID
}

// Helper type for time slot format validation
export type TimeSlotFormat = `${number}:${number}-${number}:${number}`;

// Utility type for creating type-safe slot requests
export interface SlotRequestBuilder {
  createSlot(params: {
    type: SlotType;
    startTime: Date;
    endTime: Date;
    maxCapacity: number;
  }): CreateSlotRequest;

  createBatchSlots(params: {
    type: SlotType;
    startDate: Date;
    endDate: Date;
    timeSlots: TimeSlotFormat[];
    maxCapacity: number;
    weekdays: Weekday[];
  }): CreateBatchSlotsRequest;
}

// Helper functions for working with slots
export const slotHelpers = {
  // Convert Date to ISO string for API
  toISOString(date: Date): string {
    return date.toISOString();
  },

  // Parse ISO string to Date
  parseISOString(isoString: string): Date {
    return new Date(isoString);
  },

  // Check if a slot is bookable (has available capacity)
  isBookable(slot: SlotResponse): boolean {
    return slot.is_available && slot.available_capacity > 0;
  },

  // Format time slot for display
  formatTimeSlot(slot: SlotResponse): string {
    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  },

  // Get weekday name from number
  getWeekdayName(weekday: Weekday): string {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[weekday];
  },

  // Validate time slot format
  isValidTimeSlotFormat(timeSlot: string): timeSlot is TimeSlotFormat {
    const regex = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
    return regex.test(timeSlot);
  },

  // Group slots by date
  groupSlotsByDate(slots: SlotResponse[]): Map<string, SlotResponse[]> {
    const grouped = new Map<string, SlotResponse[]>();

    slots.forEach((slot) => {
      const dateKey = new Date(slot.start_time).toLocaleDateString();
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, slot]);
    });

    return grouped;
  },
};
