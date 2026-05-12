// Shared entity interfaces used across admin pages

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_no: string;
  date_of_birth: string;
  groups: number[];
  is_active: boolean;
  is_superuser: boolean;
}

export interface Type {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  categories: { id: string; name: string }[];
}

export interface Category {
  id: string;
  name: string;
  type: string | { id: string; name: string };
  material_icon?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  payment_method: string;
  is_active: boolean;
  created_at: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface AIQuestion {
  id: string;
  question: string;
  category: string;
  response_template: string;
  logic_type?: string;
  is_active: boolean;
  is_dynamic: boolean;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  action_display: string;
  module: string;
  object_id: string;
  changes?: { old?: unknown; new?: unknown };
  changes_summary?: { changed_fields?: string[]; field_count?: number; action?: string };
  timestamp?: string;
  formatted_timestamp: string;
}

// Generic paginated API response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
