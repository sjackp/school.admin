-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id bigserial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'viewer',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigserial PRIMARY KEY,
  admin_user_id bigint REFERENCES public.admin_users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text NOT NULL,
  changes jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);


