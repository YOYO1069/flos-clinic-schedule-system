import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://clzjdlykhjwrlksyjlfz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsempkbHlraGp3cmxrc3lqbGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0NTQ3OTEsImV4cCI6MjA0NjAzMDc5MX0.bZMCMeP7xCwdwJLr5_eBpWKbBxqTQBWp5TgVEwWPqPk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
