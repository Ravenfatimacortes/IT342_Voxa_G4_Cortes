require('dotenv').config();
const { supabaseAdmin } = require('../config/database');

async function updateRoleConstraint() {
  try {
    console.log('Updating database role constraint...');

    // First, let's check the current constraint
    const { data: currentConstraint, error: constraintError } = await supabaseAdmin
      .rpc('get_constraint_info', { table_name: 'users', constraint_name: 'users_role_check' });

    if (constraintError) {
      console.log('Could not get constraint info, proceeding with update...');
    }

    // Drop the existing constraint
    console.log('Dropping existing constraint...');
    const { error: dropError } = await supabaseAdmin
      .rpc('execute_sql', { 
        sql: 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;' 
      });

    if (dropError) {
      console.error('Error dropping constraint:', dropError);
      // Try alternative approach
      console.log('Trying alternative approach...');
    }

    // Add the new constraint that allows both student and teacher roles
    console.log('Adding new constraint with teacher role...');
    const { error: addError } = await supabaseAdmin
      .rpc('execute_sql', { 
        sql: 'ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (\'student\', \'teacher\'));' 
      });

    if (addError) {
      console.error('Error adding new constraint:', addError);
      
      // Try direct SQL execution
      console.log('Trying direct SQL execution...');
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('role')
          .limit(1);
        
        console.log('Current roles in database:', data);
        
        // Test if we can insert a teacher role
        const testData = {
          first_name: 'Test',
          last_name: 'Teacher',
          email: 'test-teacher-check@voxa.com',
          password: 'test123',
          role: 'teacher'
        };
        
        const { data: insertTest, error: insertError } = await supabaseAdmin
          .from('users')
          .insert(testData)
          .select();
          
        if (insertError) {
          console.error('Still cannot insert teacher role:', insertError);
          console.log('Manual database update required. Please run this SQL in Supabase SQL Editor:');
          console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
          console.log('ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (\'student\', \'teacher\'));');
        } else {
          console.log('✅ Teacher role constraint updated successfully!');
          
          // Clean up test data
          await supabaseAdmin
            .from('users')
            .delete()
            .eq('email', 'test-teacher-check@voxa.com');
        }
      } catch (directError) {
        console.error('Direct approach failed:', directError);
      }
    } else {
      console.log('✅ Role constraint updated successfully!');
    }

    // Test the new constraint
    console.log('Testing teacher role insertion...');
    const testTeacher = {
      first_name: 'Test',
      last_name: 'Teacher',
      email: 'teacher-test@voxa.com',
      password: 'test123',
      role: 'teacher'
    };

    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .insert(testTeacher)
      .select();

    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log('✅ Teacher role test passed!');
      
      // Clean up test data
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('email', 'teacher-test@voxa.com');
    }

  } catch (error) {
    console.error('Error updating role constraint:', error);
  }
}

updateRoleConstraint();
