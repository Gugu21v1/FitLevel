-- Fix user types for admin and academy accounts

-- Update the admin account
UPDATE profiles 
SET type = 'admin' 
WHERE email = 'fitlevel2025@gmail.com';

-- Update the academy account (Alpha)
UPDATE profiles 
SET type = 'academia' 
WHERE email = 'luizgamerbr047@gmail.com';

-- Verify the changes
SELECT id, name, email, type, created_at 
FROM profiles 
WHERE email IN ('fitlevel2025@gmail.com', 'luizgamerbr047@gmail.com')
ORDER BY created_at DESC;