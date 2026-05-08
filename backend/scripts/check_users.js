require('dotenv').config();
const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    console.log('=== Checking User Accounts ===\n');

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, first_name, last_name, created_at')
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log('Found users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} - Role: ${user.role} - Name: ${user.first_name} ${user.last_name}`);
    });

    // Create/update a test student with known password
    console.log('\n🔄 Creating test student with known password...');
    
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: users[0]?.id, // Use existing student ID or create new
        email: 'ravenfatima.cortes@cit.edu',
        password: hashedPassword,
        role: 'student',
        first_name: 'Raven',
        last_name: 'Cortes'
      })
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      return;
    }

    console.log(`✅ Test student updated: ${updatedUser.email}`);
    console.log(`   - Password: ${testPassword}`);
    console.log(`   - Role: ${updatedUser.role}`);

    // Create/update a test faculty with known password
    console.log('\n🔄 Creating test faculty with known password...');
    
    const facultyPassword = 'faculty123';
    const hashedFacultyPassword = await bcrypt.hash(facultyPassword, 10);
    
    const { data: updatedFaculty, error: facultyError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: users[1]?.id, // Use existing faculty ID
        email: 'faculty@voxa.com',
        password: hashedFacultyPassword,
        role: 'teacher',
        first_name: 'Faculty',
        last_name: 'One'
      })
      .select()
      .single();

    if (facultyError) {
      console.error('❌ Error updating faculty:', facultyError);
      return;
    }

    console.log(`✅ Test faculty updated: ${updatedFaculty.email}`);
    console.log(`   - Password: ${facultyPassword}`);
    console.log(`   - Role: ${updatedFaculty.role}`);

    console.log('\n🎉 Test credentials ready:');
    console.log('   - Student: ravenfatima.cortes@cit.edu / test123');
    console.log('   - Faculty: faculty@voxa.com / faculty123');
    console.log('   - Faculty2: faculty@gmail.com / faculty123');

    // Now test login
    console.log('\n🔄 Testing login with new credentials...');
    
    const axios = require('axios');
    const api = axios.create({
      baseURL: 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    try {
      const response = await api.post('/auth/login', {
        email: 'ravenfatima.cortes@cit.edu',
        password: 'test123'
      });

      console.log('✅ Student login successful!');
      console.log(`   - Token received: ${response.data.token ? 'Yes' : 'No'}`);
      console.log(`   - User: ${response.data.user?.email}`);

      // Test surveys with the token
      if (response.data.token) {
        const authenticatedApi = axios.create({
          baseURL: 'http://localhost:5000/api/v1',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${response.data.token}`
          }
        });

        const surveysResponse = await authenticatedApi.get('/surveys', {
          params: { status: 'available', limit: 20 }
        });

        console.log(`✅ Surveys API successful!`);
        console.log(`   - Surveys returned: ${surveysResponse.data.surveys.length}`);
        
        surveysResponse.data.surveys.forEach((survey, index) => {
          const creator = survey.creator;
          const isFirstFaculty = survey.isFirstFacultySurvey;
          const badge = isFirstFaculty ? '👑' : '📝';
          
          console.log(`   ${index + 1}. ${badge} "${survey.title}" by ${creator?.fullName}`);
        });

        console.log('\n🎉 FULL SYSTEM WORKING!');
        console.log('💡 Use these credentials to test in the frontend:');
        console.log('   - Student: ravenfatima.cortes@cit.edu / test123');
        console.log('   - Faculty: faculty@voxa.com / faculty123');
      }

    } catch (loginError) {
      console.error('❌ Login test failed:', loginError.message);
      if (loginError.response) {
        console.error('Response:', loginError.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers();
