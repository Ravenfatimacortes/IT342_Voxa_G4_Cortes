require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function checkTablesExist() {
  try {
    console.log('=== Checking Tables Exist ===');
    
    const tables = ['users', 'surveys', 'questions', 'responses', 'answers', 'posts', 'comments', 'likes'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTablesExist();
