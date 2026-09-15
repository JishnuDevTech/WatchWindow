# WatchWindow

**Know your window. Own your watch.**

WatchWindow is a shared household TV scheduling platform that solves a simple but common problem: multiple family members share one TV, and everyone has different viewing plans.

Instead of repeatedly checking whether the TV is free, family members can see a shared schedule, request viewing windows, discover available slots, and reserve them.

## Features

- **Shared TV Schedule** - See what's on at a glance with a beautiful timeline view
- **Family Management** - Invite family members and manage who can schedule
- **Flexible Scheduling** - Plan viewing windows for today or any future date
- **Invite System** - Share a family code to add members easily
- **Responsive Design** - Works beautifully on desktop and mobile
- **Real-time Updates** - Stay in sync with live schedule changes

## Project Structure

```
WatchWindow/
├── frontend/                 # React + Vite UI application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Full page components
│   │   ├── services/        # API and data services
│   │   ├── data/            # Local fallback data
│   │   ├── app.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/             # API route handlers
│   │   ├── models/          # SQLAlchemy models and Pydantic schemas
│   │   ├── services/        # Business logic services
│   │   ├── core/            # Configuration and database setup
│   │   └── main.py          # FastAPI application
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── tv/                       # Future: Fire TV app
│
└── README.md
```

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Lucide React** - Icons
- **date-fns** - Date utilities
- **Axios** - HTTP client

### Backend
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Authentication
- **JWT** - Token-based auth (Firebase integration ready)

## Getting Started

### Prerequisites

- Node.js 16+ (for frontend)
- Python 3.10+ (for backend)
- PostgreSQL 13+ (database)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd WatchWindow
   ```

2. **Create a virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

5. **Create database** (PostgreSQL)
   ```bash
   createdb watchwindow
   ```

6. **Run the backend**
   ```bash
   uvicorn app.main:app --reload
   ```

   Backend will be available at `http://localhost:8000`
   API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

## Getting Started In The App

1. Start both backend and frontend servers
2. Go to `http://localhost:5173`
3. Create an account or sign in
4. Create or join a family
5. Find an available TV window and reserve it from the schedule

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user
- `GET /api/auth/verify` - Verify token

### Families
- `GET /api/users/families` - Get user's families
- `POST /api/families` - Create new family
- `POST /api/families/join` - Join family with code
- `GET /api/families/{id}/members` - Get family members
- `GET /api/families/{id}/invite-code` - Get invite code
- `POST /api/families/{id}/invite` - Invite member by email

### TV Schedule
- `GET /api/families/{id}/schedule` - Get schedule
- `POST /api/families/{id}/schedule` - Create event
- `GET /api/families/{id}/schedule/{eventId}` - Get event
- `PATCH /api/families/{id}/schedule/{eventId}` - Update event
- `DELETE /api/families/{id}/schedule/{eventId}` - Delete event
- `GET /api/families/{id}/available-slots` - Get available time slots

### Reservations
- `GET /api/families/{id}/reservations` - Get family reservations
- `GET /api/users/{id}/reservations` - Get user reservations
- `POST /api/reservations` - Create reservation
- `PATCH /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

## Architecture

### Frontend Architecture
```
UI Components
    ↓
React Router (Pages)
    ↓
Services (API + Data)
    ↓
Axios (HTTP Client)
    ↓
Backend API
```

### Backend Architecture
```
FastAPI Routes
    ↓
Service Layer (Business Logic)
    ↓
SQLAlchemy Models
    ↓
PostgreSQL Database
```

## Future Roadmap

- **WebSocket Support** - Real-time schedule updates
- **AI Scheduling** - Smart conflict resolution and recommendations
- **Fire TV App** - Direct TV control and display
- **Mobile App** - Native iOS/Android applications
- **Notifications** - Push and email notifications
- **Occupancy Detection** - Automatic TV status detection
- **Custom Scheduling Rules** - Allow/block time slots
- **Usage Analytics** - Track viewing patterns

## Design Philosophy

WatchWindow is built on these principles:

- **Simple** - Solves one problem really well
- **Friendly** - Family-oriented, not corporate
- **Trustworthy** - Clean, transparent code
- **Calm** - Not flashy or over-engineered
- **Extensible** - Clean architecture for future features

## Data Model

### Users
- Unique identifier (UID from Firebase)
- Email and name
- Created/updated timestamps

### Families
- Name and description
- Unique invite code
- TV name
- Multiple members and schedules

### Family Members
- User and family relationship
- Role (admin/member)
- Join date

### TV Schedules
- Title and description
- Start/end times
- Status (scheduled/ongoing/completed)
- Family and user references

### Reservations
- Member viewing request
- Requested time slot
- Status (pending/confirmed/cancelled)

## Development Notes

### Key Design Decisions

1. **Frontend Services** - All API calls go through services, making it easy to swap implementations
2. **Local Fallback Data** - Local fallback data keeps the interface usable while the backend is unavailable
3. **Clean Separation** - UI knows nothing about database implementation
4. **Placeholder Interfaces** - Reserved features (scheduling engine, AI) have clean interfaces

### What's NOT Implemented

The following are intentionally reserved for future phases:

- Scheduling algorithm
- Free-window calculation
- Conflict-resolution engine
- AI recommendations
- Fire TV integration
- WebSocket real-time sync
- Notification system
- Occupancy detection

## Testing

### Frontend Testing
```bash
cd frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend Testing
```bash
cd backend
pytest            # Run tests
uvicorn app.main:app --reload  # Dev server
```

## Deployment

### Frontend (Vercel, Netlify, etc.)
```bash
npm run build
# Deploy the `dist` folder
```

### Backend (Heroku, AWS, DigitalOcean, etc.)
```bash
# Set environment variables
# Deploy with Python requirements.txt
# Update CORS_ORIGINS for production domains
```

## Contributing

This is a foundation project. Future development should:

1. Maintain the existing architecture
2. Add features without breaking APIs
3. Keep the calm, friendly design
4. Document new features clearly
5. Test all interactive features

## License

© 2024 WatchWindow. All rights reserved.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

**Know your window. Own your watch.**