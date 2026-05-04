require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function testMinimalPost() {
  try {
    console.log('Testing minimal post insertion...');
    
    // Try inserting with just the required fields
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: 37,
        content: 'Test post content',
        type: 'general'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error inserting minimal post:', error);
    } else {
      console.log('✅ Minimal post created successfully:', data);
      console.log('Columns:', Object.keys(data));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testMinimalPost();
