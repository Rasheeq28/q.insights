const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://udarzmjsmaojceashsld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkYXJ6bWpzbWFvamNlYXNoc2xkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3MDcyNSwiZXhwIjoyMDY1MDQ2NzI1fQ.0cXvjnwDZZtfdphqUUs46X2xuV1WQNt3z8-19f4UqRw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('dsex_prices').select('*').limit(1);
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]).join(', '));
  }
  process.exit(0);
}

run();
