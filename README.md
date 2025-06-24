# College Album - Photo Scrapbook

A beautiful photo scrapbook application built with React and FastAPI.

## Features

- Upload and organize photos with stories
- Search and filter entries
- Favorite entries
- Soft delete with restore functionality
- Responsive design with Tailwind CSS

## Local Development

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend:
   ```bash
   python run.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## Deployment on Render

### Prerequisites

1. Create a Render account at [render.com](https://render.com)
2. Connect your GitHub repository to Render

### Backend Deployment

1. In your Render dashboard, click "New +" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `college-album-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

4. Add environment variables:
   - `ENVIRONMENT`: `production`
   - `PYTHON_VERSION`: `3.9.18`

5. Create a PostgreSQL database:
   - Click "New +" and select "PostgreSQL"
   - Name it `college-album-db`
   - Copy the connection string and add it as `DATABASE_URL` environment variable

### Frontend Deployment

1. In your Render dashboard, click "New +" and select "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `college-album-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Root Directory**: `frontend`

4. Add environment variable:
   - `REACT_APP_API_URL`: `https://your-backend-url.onrender.com`

### Alternative: Using render.yaml

You can also deploy using the provided `render.yaml` files:

1. For backend: Use the `backend/render.yaml` file
2. For frontend: Use the `frontend/render.yaml` file

## API Endpoints

- `GET /entries/` - Get all entries with optional filtering
- `POST /entries/` - Create a new entry
- `GET /entries/{id}` - Get a specific entry
- `PUT /entries/{id}` - Update an entry
- `DELETE /entries/{id}` - Delete an entry
- `POST /entries/{id}/favorite` - Toggle favorite status
- `GET /deleted-entries/` - Get deleted entries
- `POST /deleted-entries/{id}/restore` - Restore a deleted entry

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Deployment**: Render
