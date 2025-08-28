ALTER TABLE `user` ADD `role` text DEFAULT 'patient' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `phone_number` text;--> statement-breakpoint
ALTER TABLE `user` ADD `employee_id` text;