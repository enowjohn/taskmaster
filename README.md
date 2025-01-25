# Task Management Application

A full-stack task management application built with React, Node.js, Express, and MongoDB.

## Features

- User Authentication (Register/Login)
- Task Management (Create, Read, Update, Delete)
- Daily Tasks
- Coding Problems Tracking
- Real-time Messaging
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coding-tasks-app
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Setup:

Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=9000
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:9000
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173 (or http://localhost:3000)
- Backend: http://localhost:9000

## Deployment

### Backend Deployment (e.g., on Heroku):
1. Create a new Heroku application
2. Set environment variables in Heroku dashboard
3. Deploy using Heroku Git or GitHub integration

### Frontend Deployment (e.g., on Vercel):
1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## Contributing

1. Create a new feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "Description of changes"
```

3. Push to your branch:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

## License

MIT License
