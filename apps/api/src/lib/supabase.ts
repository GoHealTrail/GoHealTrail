import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

const envPathCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '.env'),
  resolve(process.cwd(), '..', '..', '.env'),
  resolve(process.cwd(), '..', '..', '..', '.env'),
]

for (const envPath of envPathCandidates) {
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8')
    if (!content.includes('SUPABASE_URL') || !content.includes('SUPABASE_SERVICE_KEY')) {
      continue
    }

    const parsed = config({ path: envPath })
    if (!parsed.error) {
      break
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    `Missing Supabase environment variables. URL set=${!!supabaseUrl}, SERVICE key set=${!!supabaseServiceKey}, cwd=${process.cwd()}`
  )
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
