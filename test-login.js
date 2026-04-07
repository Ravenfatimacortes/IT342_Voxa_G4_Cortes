// Test login with Supabase directly
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://kxzwvqjhrfynomvherve.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4end2cWpocmZ5bm9tdmhlcnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MDg4NjAsImV4cCI6MjA5MDE4NDg2MH0.i3bp3pvmHI3i82oK239xIRX4OOdwy2dVU9jspVK4Ihc';

console.log('Testing Supabase login...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    // Test with the confirmed user from the database
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'ravenfatima.cortes@cit.edu',
      password: 'password123', // You'll need to provide the actual password
    });

    if (error) {
      console.error('Login error:', error);
      console.error('Error message:', error.message);
    } else {
      console.log('Login successful!');
      console.log('User:', data.user);
      console.log('Session:', data.session);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testLogin();
