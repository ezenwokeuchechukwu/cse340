--  Insert a new “Tony Stark” record into the account table
INSERT INTO public.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password
) 
VALUES (
  'Tony',
  'Stark',
  'tony@starkent.com',
  'Iam1ronM@n'
);


-- Update the account_type for the “Tony Stark” record to “Admin”
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';


-- Delete the “Tony Stark” record from the account table
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';


-- Modify the “GM Hummer” record to replace “small interiors” with “a huge interior”
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM'
  AND inv_model = 'Hummer';


-- Use an INNER JOIN to select make, model, and Classification_name for items belonging to the “Sport” category
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
JOIN public.classification AS c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';


-- Update all inventory records to add “/vehicles” in the middle of the inv_image and inv_thumbnail paths
UPDATE public.inventory
SET inv_image      = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail  = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
