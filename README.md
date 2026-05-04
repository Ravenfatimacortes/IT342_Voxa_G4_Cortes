# Voxa - Voice + Expression

A simplified online feedback and survey system that allows students to submit feedback and respond to surveys through a centralized digital platform.

## Features

### Core Features
- **User Authentication**: Secure registration and login system with JWT tokens
- **Role-Based Access**: Different interfaces for students and faculty/administrators
- **Survey Management**: Create, edit, publish, and manage surveys
- **Survey Taking**: Interactive survey interface with multiple question types
- **Response Management**: View and analyze student responses
- **Profile Management**: Update user information and change passwords

### Question Types
- Multiple Choice (single select)
- Short Answer

### User Roles
- **Student**: View available surveys, take surveys, view own responses
- **Faculty/Admin**: Create and manage surveys, view all responses, export data

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-rate-limit** for API protection
- **express-validator** for input validation

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for form management
- **Axios** for API calls
- **React Hot Toast** for notifications

## Project Structure

```
IT342_Voxa_G4_Cortes/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Survey.js
│   │   └── Response.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── surveys.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── web/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── TakeSurvey.js
│   │   │   │   ├── MyResponses.js
│   │   │   │   └── ResponseDetails.js
│   │   │   ├── faculty/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── SurveyManagement.js
│   │   │   │   ├── CreateSurvey.js
│   │   │   │   ├── EditSurvey.js
│   │   │   │   ├── SurveyResponses.js
│   │   │   │   └── ResponseView.js
│   │   │   ├── Profile.js
│   │   │   └── NotFound.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .gitignore
│   ├── package.json
│   └── tailwind.config.js
├── docs/
├── mobile/
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IT342_Voxa_G4_Cortes
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/voxa
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=1h
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

5. **Frontend Setup**
   ```bash
   cd ../web
   npm install
   ```

6. **Start the frontend development server**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - User logout

### Surveys (Students)
- `GET /api/v1/surveys` - Get available surveys
- `GET /api/v1/surveys/:id` - Get survey details
- `POST /api/v1/surveys/:id/responses` - Submit survey response

### User Management
- `GET /api/v1/users/responses` - Get user's responses
- `GET /api/v1/users/responses/:id` - Get specific response
- `PUT /api/v1/users/profile` - Update profile
- `PUT /api/v1/users/password` - Change password

### Admin/Faculty
- `GET /api/v1/admin/surveys` - Get all surveys
- `POST /api/v1/admin/surveys` - Create survey
- `PUT /api/v1/admin/surveys/:id` - Update survey
- `DELETE /api/v1/admin/surveys/:id` - Delete survey
- `POST /api/v1/admin/surveys/:id/publish` - Publish survey
- `POST /api/v1/admin/surveys/:id/unpublish` - Unpublish survey
- `GET /api/v1/admin/surveys/:id/responses` - Get survey responses
- `GET /api/v1/admin/surveys/:id/responses/:userId` - Get specific response

## Security Features

- **Password Hashing**: Using bcrypt with salt rounds (12)
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **Role-Based Access**: Proper authorization checks for different user roles
- **HTTPS Ready**: Configured for secure communication

## Performance Requirements

- API response time: ≤ 2 seconds for 95% of requests
- Dashboard load time: ≤ 2 seconds for authenticated users
- Support 100 concurrent users during peak periods
- Survey submission processing: ≤ 3 seconds

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch-friendly interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

### Should Have
- Edit Profile Information
- Basic Survey Analytics
- Pagination for Long Survey Lists
- Confirmation Email on Registration
- "Not Now" option to postpone a survey

### Could Have
- Password Reset Functionality
- Survey Expiration Dates
- Draft Survey Capability
- UI Theme Selector

### Won't Have (Out of Scope)
- Anonymous Feedback
- File Attachments
- Real-time Chat/Discussions
- Advanced Data Visualization
- AI-based Sentiment Analysis
