require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkAllTables() {
  try {
    console.log('Checking for comment-related tables...');
    
    // Try to get table info from information schema
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('comment');
    
    if (error) {
      console.error('Error checking tables:', error);
    } else {
      console.log('✅ Comment-related tables found:');
      if (data) {
        data.forEach(table => console.log(`- ${table.table_name}`));
      } else {
        console.log('No comment-related tables found');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllTables();
