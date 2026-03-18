-- Update notification email to studio address
UPDATE public.site_settings 
SET value = 'studiofotowarna@gmail.com' 
WHERE key = 'notification_email';
