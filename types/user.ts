export type User = {
  id: string;
  email: string;
  account_type: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
  payment_method_id?: string;
  created_at: string;
  updated_at: string;
};

export type UpdateProfileRequest = {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
  payment_method_id?: string;
};
