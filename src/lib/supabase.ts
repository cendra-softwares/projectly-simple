import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rguprofepnfhducncsqh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndXByb2ZlcG5maGR1Y25jc3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzU4MzgsImV4cCI6MjA3MzQ1MTgzOH0.3MNLE_0QdOYEGSQBuEzUTteaXHJiwYwJNH3Fb-xuaCQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)