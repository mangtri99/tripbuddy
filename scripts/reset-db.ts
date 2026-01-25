import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

async function resetDatabase() {
  console.log('Resetting database...')

  // Truncate all tables with CASCADE to handle foreign keys
  try {
    await sql`
      TRUNCATE TABLE
        insurance_claims,
        user_insurances,
        insurance_plans,
        partner_reviews,
        partner_requests,
        partner_searches,
        travel_partner_profiles,
        budgets,
        expense_participants,
        shared_expenses,
        expenses,
        activity_vote_responses,
        activity_vote_options,
        activity_votes,
        group_announcements,
        group_invitations,
        group_members,
        travel_groups,
        saved_places,
        reviews,
        itinerary_items,
        trips,
        places,
        password_reset_tokens,
        sessions,
        users
      CASCADE
    `
    console.log('✅ All tables truncated successfully!')
  } catch (error) {
    console.error('Error truncating tables:', error)
  }
}

resetDatabase().catch(console.error)
