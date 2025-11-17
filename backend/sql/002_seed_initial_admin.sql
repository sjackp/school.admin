-- Seed initial admin user
-- Default password: admin123 (CHANGE THIS IMMEDIATELY IN PRODUCTION)

INSERT INTO public.admin_users (username, password_hash, full_name, role)
VALUES (
  'admin',
  '$2b$10$uF5x.9F5tU8v7G8BqzZy1uGZCq0XvK4s7B4QG8tq7m7ZJ5n1rK2a', -- bcrypt hash placeholder
  'System Administrator',
  'admin'
)
ON CONFLICT (username) DO NOTHING;


