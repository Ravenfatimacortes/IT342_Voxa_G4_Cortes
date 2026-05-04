require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function testProfileUpdate() {
  try {
    console.log('=== Testing Profile Update ===');
    
    // Use existing user ID 38
    const userId = 38;
    
    // Get current user
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (findError) {
      console.log('❌ User not found:', findError.message);
      return;
    }
    
    console.log('✅ User found:', user);
    
    // Test profile update
    const updateData = {
      first_name: 'Test Updated',
      last_name: 'User'
    };
    
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
      return;
    }
    
    console.log('✅ Profile updated successfully:', updatedUser);
    
    // Verify the update
    const { data: verifiedUser, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      return;
    }
    
    console.log('✅ Verification successful:', verifiedUser);
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testProfileUpdate();
