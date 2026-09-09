import { supabase } from './lib/supabase.js'
import { demoTrails, demoAlerts, demoCommunityUpdates } from './data/trails.js'

export async function seedDatabase() {
  console.log('Seeding database...')

  // Insert trails
  const { error: trailsError } = await supabase
    .from('trails')
    .upsert(demoTrails, { onConflict: 'id' })
  if (trailsError) {
    console.error('Error seeding trails:', trailsError)
    throw trailsError
  }
  console.log(`Inserted/updated ${demoTrails.length} trails`)

  // Insert alerts
  const { error: alertsError } = await supabase
    .from('alerts')
    .upsert(demoAlerts.map((a) => ({ ...a, id: undefined })), { onConflict: 'id' })
  if (alertsError) {
    console.error('Error seeding alerts:', alertsError)
    throw alertsError
  }
  console.log(`Inserted/updated ${demoAlerts.length} alerts`)

  // Insert community updates
  const { error: updatesError } = await supabase
    .from('community_trail_updates')
    .upsert(
      demoCommunityUpdates.map((update, index) => ({
        id: `community-${index}`,
        trail_id: update.trailId,
        category: update.category,
        severity: update.severity,
        message: update.message,
        reporter: update.reporter,
      })),
      { onConflict: 'id' }
    )

  if (updatesError) {
    console.error('Error seeding community updates:', updatesError)
    throw updatesError
  }
  console.log(`Inserted/updated ${demoCommunityUpdates.length} community updates`)

  console.log('Seeding complete')
}