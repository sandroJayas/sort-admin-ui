import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "@/types/user";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stringToDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function isUserValid(user: User | undefined | null): boolean {
  return !!(
    user &&
    user.first_name &&
    user.last_name &&
    user.address_line_1 &&
    user.city &&
    user.postal_code &&
    user.phone_number
  );
}
