export type Item = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  image_url: string;
};

export type BoxStatus =
  | "in_transit"
  | "pending_pack"
  | "pending_pickup"
  | "stored"
  | "returned"
  | "disposed";

export type Box = {
  id: string;
  packing_mode: string;
  status: BoxStatus;
  items: Item[];
  created_at: string;
  updated_at: string;
  pickup_address: Address;
};

export type Address = {
  street: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
};

export type CreateBoxRequest = {
  packing_mode: "self" | "sort";
  item_name?: string;
  item_note?: string;
  pickup_address: Address;
  quantity?: number;
};

export type CreateBoxResponse = {
  ids: string[];
};
