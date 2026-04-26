const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://udarzmjsmaojceashsld.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkYXJ6bWpzbWFvamNlYXNoc2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NzA3MjUsImV4cCI6MjA2NTA0NjcyNX0.d4P1KNfglej-JhvzeFEUYqvfjtwYErsZPzOfMG0pdjI');

async function run() {
  const { data, error } = await supabase.from('v_dsex_flat').select('*').limit(2);
  console.log("View Data:", data);
  console.log("Error:", error);
  
  const { data: tbData } = await supabase.from('dsex_prices').select('*').limit(2);
  console.log("Table Data:", tbData);

  const { data: mapperData } = await supabase.from('dsex_mapper').select('*').limit(2);
  console.log("Mapper Data:", mapperData);
}
run();
