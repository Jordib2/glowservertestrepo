# GLOW App
# 7 and 1 Nights, 1001 Stories
A digital storytelling platform for the GLOW project that transforms children’s physical paper cutouts into a large-scale animated visual artwork for classroom, city-wide, and online exhibition.

## Project Overview
**7 and 1 Nights, 1001 Stories** is an interactive art and education project inspired by the idea of continuous storytelling. Children create black paper silhouettes with open-ended narrative meaning, these works are photographed and uploaded by teachers, and the system transforms them into a digital “moving tapestry” that can be projected as an endless visual story.

The platform supports the full workflow from classroom creation to digital processing and exhibition. Its purpose is to connect children, classes, schools, and municipalities into one shared artistic narrative.

## Tools & Technologies
- **Frontend:** React.js, TypeScript, Vite, PWA
- **Backend:** Python
- **Database:** MySQL
- **Cloud Server:** Hetzner
- **Management:** Jira

## Workflow
1. A teacher logs into the app.
2. he teacher uploads photographs of children’s black paper silhouettes.
3. The backend receives the files and stores the submission metadata.
4. The backend processes the images:
- detects shapes
- extracts contours
- prepares vector or clean digital assets
- organizes artworks into a collage
- applies inversion and animation logic
5. The generated output becomes available for:
- classroom projection
- school exhibition
- central GLOW exhibition
- online presentation
6. The online platform displays the final work with school and class context.


## Deployment Plan
The application can be deployed on Hetzner with a simple setup such as:
- one virtual server for frontend and backend
- one MySQL instance on the same server or separate managed environment
- reverse proxy for HTTPS routing
- persistent storage for uploads and generated media

## Status
This project is currently under development.


## Setup Guide
## Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MySQL database
- Git

## Cloning the Repository
1. Clone the repository from GitHub:
   ```bash
   git clone <repository-url>
   cd GLOW
   ```

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd GLOW-backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```
- On Windows:
  ```bash
  venv\Scripts\activate
  ```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables
1. Copy the `.env` file and fill in your database credentials:
   ```
   APP_NAME=
   APP_ENV=
   APP_HOST=
   APP_PORT=

   DB_USER=
   DB_PASSWORD=
   DB_HOST=
   DB_PORT=
   DB_NAME=
   ```

2. Ensure MySQL is running and create the database specified in `DB_NAME`.

### 6. Run the Backend
```bash
python app/main.py
```
The backend will start on `http://127.0.0.1:8000`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd ../GLOW-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the frontend root:
```
VITE_API_BASE_URL=
```

### 4. Run the Frontend
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`

## Running the Full Application
1. Ensure MySQL is running
2. Start the backend (from `GLOW-backend` directory with venv activated):
   ```bash
   python app/main.py
   ```
3. In a new terminal, start the frontend (from `GLOW-frontend` directory):
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser

## Project Architecture

### Backend (GLOW-backend)
The backend is built with FastAPI and follows a layered architecture:

- **`app/main.py`**: Entry point that creates the FastAPI app and includes routers
- **`app/api/controllers/`**: API endpoints
  - `video_controller.py`: Handles video generation, review, and export endpoints
- **`app/services/`**: Business logic layer
  - `collage_service.py`: Manages collage creation from uploaded images
  - `video_service.py`: Handles video generation from collages
  - `upload_service.py`: Processes and validates uploaded images
  - `export_service.py`: Manages video export functionality
- **`app/persistence/`**: Data access layer
  - `database/session.py`: SQLAlchemy database session configuration
  - `models/`: Database models (currently minimal implementation)
  - `repositories/`: Data access objects for database operations
    - `collage_repository.py`: Collage data operations
    - `images_repository.py`: Image data operations
    - `video_repository.py`: Video data operations
- **`app/dtos/`**: Data Transfer Objects for API requests/responses
  - `upload_dto.py`: Structure for uploaded images data
  - `video_dto.py`: Structure for video data
- **`app/core/config.py`**: Application configuration and settings management
- **`app/processing/`**: Image and video processing utilities (to be implemented)
- **`app/utils/`**: General utility functions

### Frontend (GLOW-frontend)
The frontend is a React application built with Vite:

- **`src/main.tsx`**: Application entry point
- **`src/app/`**: Application-level components
  - `router.tsx`: React Router configuration with routes for the collage generation workflow
  - `layout.tsx`: Main layout component with header
- **`src/features/collage-generator/`**: Feature-specific code for the collage generation workflow
  - `pages/`: Page components for each step
    - `ImagesUploadPage.tsx`: Upload images interface
    - `ImagesReviewPage.tsx`: Review uploaded images
    - `CollageEditorPage.tsx`: Edit collage composition
    - `CollageReviewExportPage.tsx`: Review and export final collage/video
  - `components/`: Reusable UI components (to be implemented)
  - `hooks/`: Custom React hooks (to be implemented)
  - `services/`: Feature-specific services (to be implemented)
  - `types/`: TypeScript type definitions (to be implemented)
  - `utils/`: Feature-specific utilities (to be implemented)
- **`src/shared/`**: Shared code across features
  - `components/`: Shared UI components
  - `services/api.ts`: Axios configuration for API calls
  - `types/`: Shared TypeScript types
  - `utils/`: Shared utility functions

## Dependencies Explanation

### Backend Dependencies
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **Uvicorn**: ASGI server for running FastAPI applications
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM) for database operations
- **PyMySQL**: MySQL database driver for Python
- **Pydantic**: Data validation and settings management using Python type annotations
- **OpenCV**: Computer vision library for image processing and analysis
- **Pillow**: Python Imaging Library for image manipulation
- **NumPy**: Fundamental package for array computing and mathematical operations
- **python-dotenv**: Loads environment variables from .env files
- **python-multipart**: Handles multipart/form-data for file uploads in FastAPI

### Frontend Dependencies
- **React**: JavaScript library for building user interfaces
- **React DOM**: React rendering library for the web
- **React Router DOM**: Declarative routing for React applications
- **Axios**: HTTP client for making API requests
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema declaration and validation library
- **@hookform/resolvers**: Resolvers for React Hook Form to work with Zod
- **clsx**: Utility for constructing conditional className strings
- **vite-plugin-pwa**: Plugin for adding PWA capabilities to Vite projects

### Development Dependencies (Frontend)
- **TypeScript**: Typed superset of JavaScript
- **Vite**: Fast build tool and development server
- **ESLint**: Linting utility for JavaScript and TypeScript
- **Prettier**: Code formatter
- **@vitejs/plugin-react**: Vite plugin for React

## Troubleshooting
- Ensure all environment variables are set correctly
- Verify MySQL connection and database creation
- Check that ports 8000 (backend) and 5173 (frontend) are available
- Run `npm install` and `pip install -r requirements.txt` if dependencies are missing