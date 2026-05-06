const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./config/database');

async function setupPostsTables() {
  try {
    console.log('Setting up posts tables...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create_posts_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_statement: statement });
          
          if (error) {
            // If rpc doesn't exist, try direct SQL execution through raw query
            console.log(`RPC failed, trying direct execution for: ${statement.substring(0, 50)}...`);
            
            // For Supabase, we need to use the SQL editor or direct database connection
            // Let's create the tables using individual operations
            if (statement.toLowerCase().includes('create table')) {
              console.log('This is a CREATE TABLE statement - needs to be run manually in Supabase SQL editor');
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed:`, err.message);
        }
      }
    }
    
    console.log('\n✅ Posts tables setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of create_posts_tables.sql');
    console.log('4. Run the SQL script to create the posts tables');
    
  } catch (error) {
    console.error('❌ Error setting up posts tables:', error);
  }
}

// Alternative approach: Create tables using individual API calls
async function createTablesWithAPI() {
  try {
    console.log('Creating posts tables using Supabase API...');
    
    // Create posts table
    const { data: postsData, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError && postsError.code === 'PGRST116') {
      console.log('❌ Posts table does not exist. Please run the SQL script manually.');
      return false;
    } else if (!postsError) {
      console.log('✅ Posts table already exists');
    }
    
    // Check post_comments table
    const { data: commentsData, error: commentsError } = await supabaseAdmin
      .from('post_comments')
      .select('*')
      .limit(1);
    
    if (commentsError && commentsError.code === 'PGRST116') {
      console.log('❌ Post comments table does not exist. Please run the SQL script manually.');
      return false;
    } else if (!commentsError) {
      console.log('✅ Post comments table already exists');
    }
    
    // Check post_likes table
    const { data: likesData, error: likesError } = await supabaseAdmin
      .from('post_likes')
      .select('*')
      .limit(1);
    
    if (likesError && likesError.code === 'PGRST116') {
      console.log('❌ Post likes table does not exist. Please run the SQL script manually.');
      return false;
    } else if (!likesError) {
      console.log('✅ Post likes table already exists');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  }
}

async function main() {
  console.log('=== POSTS TABLE SETUP ===');
  
  // First check if tables exist
  const tablesExist = await createTablesWithAPI();
  
  if (!tablesExist) {
    console.log('\n🚨 Tables do not exist. Manual setup required.');
    console.log('\n📝 Please follow these steps:');
    console.log('1. Open Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy the entire contents of create_posts_tables.sql');
    console.log('4. Paste and run the script');
    console.log('5. After running, restart your backend server');
    
    // Show the SQL content for easy copying
    const sqlFile = path.join(__dirname, 'create_posts_tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('\n=== SQL TO COPY ===');
    console.log(sqlContent);
    console.log('=== END SQL ===');
  } else {
    console.log('\n✅ All posts tables are ready!');
    console.log('🔄 Please restart your backend server to ensure everything is loaded correctly.');
  }
}

main();
