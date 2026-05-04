require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function testMinimalComment() {
  try {
    console.log('Testing minimal comment insertion...');
    
    // Try inserting with just the required fields
    const { data, error } = await supabaseAdmin
      .from('post_comments')
      .insert({
        post_id: 7,
        user_id: 37,
        content: 'Test comment content'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error inserting minimal comment:', error);
    } else {
      console.log('✅ Minimal comment created successfully:', data);
      console.log('Columns:', Object.keys(data));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testMinimalComment();
