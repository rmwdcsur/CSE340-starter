


















-- LAST THING TO RUN IN REBUILD.SQL

UPDATE public.inventory SET inv_description = REPLACE(inv_description,'small interiors','a huge interior') WHERE inv_id = 10;

UPDATE public.inventory SET inv_image = REPLACE(inv_image,'/images','images/vehicles'), inv_thumbnail = REPLACE(inv_thumbnail,'/images','/images/vehicles');