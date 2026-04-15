# Supabase Schema Setup Guide for Voxa

This guide will help you set up the enhanced Supabase schema with role-based authentication and dashboard routing.

## Prerequisites

1. Supabase account and project
2. Node.js and npm installed
3. Backend project dependencies installed

## Step 1: Configure Supabase Connection

1. Open your `.env` file in the backend directory
2. Add your Supabase credentials:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Set Up the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `enhanced_supabase_schema.sql`
4. Click **Run** to execute the schema

This will:
- Create all necessary tables (users, surveys, questions, responses, answers)
- Set up Row Level Security (RLS) policies
- Create helper functions for role-based access
- Insert a default admin account

## Step 3: Create the Admin Account

1. Update the `create_admin.js` script with your Supabase credentials
2. Run the script to create/update the admin account:

```bash
cd backend
node create_admin.js
```

**Default Admin Credentials:**
- Email: `admin`
- Password: `password123`

## Step 4: Update Your Backend Authentication

### Modify your authentication middleware to check user roles:

```javascript
// Example middleware for role-based access
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role, is_active')
        .eq('id', req.user.id)
        .single();
      
      if (error || !user || !user.is_active) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (user.role !== requiredRole && user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      req.user.role = user.role;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authentication error' });
    }
  };
};
```

## Step 5: Implement Dashboard Routing

### Frontend Dashboard Routing Logic:

```javascript
// After successful login
const user = response.data.user;
const dashboardRoute = getDashboardRoute(user.role);

function getDashboardRoute(role) {
  switch(role) {
    case 'student':
      return '/student-dashboard';
    case 'faculty':
      return '/faculty-dashboard';
    case 'admin':
      return '/admin-dashboard';
    default:
      return '/login';
  }
}

// Redirect to appropriate dashboard
window.location.href = dashboardRoute;
```

## Step 6: Test the Setup

1. **Test Admin Login:**
   - Email: `admin`
   - Password: `password123`
   - Should redirect to admin dashboard

2. **Test Student Registration:**
   - Register a new student account
   - Should redirect to student dashboard

3. **Test Faculty Registration:**
   - Register a new faculty account
   - Should redirect to faculty dashboard

## Step 7: Verify Database Security

Test that users can only access their own data:

1. Students should only see their own responses
2. Faculty should see surveys they created and responses
3. Admin should see all data

## Database Schema Overview

### Users Table
- `id`: Primary key
- `first_name`, `last_name`: User's name
- `email`: Unique email address
- `password`: Hashed password
- `role`: 'student', 'faculty', or 'admin'
- `student_id`: Optional student ID
- `department`: User's department
- `is_active`: Account status
- `last_login`: Last login timestamp

### Role-Based Access Control

The schema includes:
- **Row Level Security (RLS)** policies for each table
- **Helper functions** for role checking
- **Dashboard access view** for routing
- **Automatic timestamp updates**

### Security Features

1. **RLS Policies**: Users can only access data they're authorized to see
2. **Role Validation**: Functions to verify user permissions
3. **Active Status Check**: Only active users can access the system
4. **Password Hashing**: Passwords are stored securely

## Troubleshooting

### Common Issues:

1. **RLS Policy Errors**: Make sure all policies are created correctly
2. **Admin Account Not Working**: Run the `create_admin.js` script again
3. **Permission Denied**: Check that the user is marked as `is_active = true`

### SQL Commands for Debugging:

```sql
-- Check if admin exists
SELECT * FROM users WHERE email = 'admin';

-- Check user roles
SELECT id, email, role, is_active FROM users;

-- Test RLS policies
SELECT * FROM user_dashboard_access;
```

## Next Steps

1. Implement frontend dashboard components
2. Add role-based UI elements
3. Set up proper error handling
4. Add email verification for new users
5. Implement password reset functionality

## Support

If you encounter any issues:
1. Check the Supabase logs
2. Verify RLS policies are enabled
3. Ensure all environment variables are set correctly
4. Test with the provided SQL debugging commands
