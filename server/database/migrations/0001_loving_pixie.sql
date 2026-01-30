ALTER TABLE "travel_groups" DROP CONSTRAINT "travel_groups_trip_id_trips_id_fk";
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "group_id" text;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_group_id_travel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."travel_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_groups" DROP COLUMN "trip_id";