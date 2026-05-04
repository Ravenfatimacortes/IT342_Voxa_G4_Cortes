require('dotenv').config();
const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testLogin() {
  try {
    console.log('=== Testing Login ===');
    
    // Find user by email
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'ravencortes0@gmail.com')
      .single();
    
    if (findError) {
      console.log('❌ User not found:', findError.message);
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Test password comparison
    const testPassword = 'Test123456';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (isPasswordValid) {
      // Generate token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret-voxa-app-2024', {
        expiresIn: '24h'
      });
      
      console.log('✅ Token generated:', token.substring(0, 50) + '...');
      
      // Test profile update with token
      const formData = {
        fullName: 'Test User Updated Again'
      };
      
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Password validation failed');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testLogin();
