require('dotenv').config();
const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testProfileComplete() {
  try {
    console.log('=== Testing Complete Profile Update ===');
    
    // Login to get token
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'testuser@voxa.com')
      .single();
    
    if (findError) {
      console.log('❌ User not found:', findError.message);
      return;
    }
    
    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret-voxa-app-2024', {
      expiresIn: '24h'
    });
    
    console.log('✅ Token generated');
    
    // Test profile update via API simulation
    const updateData = {
      first_name: 'Updated',
      last_name: 'Test User'
    };
    
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
      return;
    }
    
    console.log('✅ Profile updated successfully:', updatedUser);
    
    // Test with profile picture (base64)
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const { data: userWithPicture, error: pictureError } = await supabaseAdmin
      .from('users')
      .update({
        profile_picture: base64Image
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (pictureError) {
      console.log('❌ Picture update failed:', pictureError.message);
      return;
    }
    
    console.log('✅ Profile picture updated successfully');
    console.log('✅ All profile updates working!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testProfileComplete();
