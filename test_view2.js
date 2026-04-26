const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://udarzmjsmaojceashsld.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkYXJ6bWpzbWFvamNlYXNoc2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NzA3MjUsImV4cCI6MjA2NTA0NjcyNX0.d4P1KNfglej-JhvzeFEUYqvfjtwYErsZPzOfMG0pdjI');

async function run() {
  const { data, error } = await supabase.from('datasets').select('*').eq('slug', 'dsex-prices-historical');
  console.log("Dataset Data:", data[0].fields);
}
run();
