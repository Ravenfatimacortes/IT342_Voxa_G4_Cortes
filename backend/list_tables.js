require('dotenv').config();
const { supabaseAdmin } = require('./config/database');

async function listTables() {
  try {
    console.log('=== Listing all tables ===');
    
    // Try to query information_schema to see what tables exist
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%response%');
    
    if (error) {
      console.error('Error querying tables:', error);
      
      // Try some common table names
      const tablesToCheck = ['responses', 'user_responses', 'survey_responses', 'answers'];
      
      for (const tableName of tablesToCheck) {
        console.log(`\n--- Checking table: ${tableName} ---`);
        try {
          const { data: tableData, error: tableError } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (tableError) {
            console.log(`❌ ${tableName}: ${tableError.message}`);
          } else {
            console.log(`✅ ${tableName}: Exists and accessible`);
            console.log('Sample data:', tableData);
          }
        } catch (err) {
          console.log(`❌ ${tableName}: ${err.message}`);
        }
      }
    } else {
      console.log('Tables with "response" in name:', data);
    }
    
  } catch (error) {
    console.error('❌ List tables error:', error);
  }
}

listTables();
