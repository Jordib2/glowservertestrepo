# GLOW App
# 7 and 1 Nights, 1001 Stories
A digital storytelling platform for the GLOW project that transforms children’s physical paper cutouts into a large-scale animated visual artwork for classroom, city-wide, and online exhibition.

## Project Overview
**7 and 1 Nights, 1001 Stories** is an interactive art and education project inspired by the idea of continuous storytelling. Children create black paper silhouettes with open-ended narrative meaning, these works are photographed and uploaded by teachers, and the system transforms them into a digital “moving tapestry” that can be projected as an endless visual story.

The platform supports the full workflow from classroom creation to digital processing and exhibition. Its purpose is to connect children, classes, schools, and municipalities into one shared artistic narrative.

## Tools & Technologies
- **Frontend:** React.js, TypeScript, Vite, PWA
- **Backend:** Python (FastAPI)
- **Database:** MySQL
- **Cloud Server:** Hetzner
- **Management:** Jira

## Workflow
1. A teacher logs into the app.
2. The teacher uploads photographs of children’s black paper silhouettes.
3. The backend receives the files and stores the submission metadata.
4. The backend processes the images:
- detects shapes
- removes the white background
- prepares vector or clean digital assets
- applies inversion and animation logic
- organizes artworks into a collage
5. The generated output becomes available for:
- classroom projection
- school exhibition
- central GLOW exhibition
- online presentation
6. The online platform displays the final work with school and class context.
- the final collage is downloadable to any device
- students and teachers can see the collages based on the class 


## Deployment Plan
The application can be deployed on Hetzner with a simple setup such as:
- one virtual server for frontend and backend
- one MySQL instance on the same server or separate managed environment
- reverse proxy for HTTPS routing
- persistent storage for uploads and generated media

## Status & Future Improvements
This project's initial development phase is complete.

**For the next development team taking over, the primary areas identified for future improvement and expansion include:**
- Security Enhancements: Auditing the application and resolving potential security vulnerabilities to ensure safe public use.
- User Profiles: Designing and implementing comprehensive profile management systems specifically tailored for teachers and students.


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
  - `accounts_controller.py`: Handles user account and authentication endpoints
  - `collages_controller.py`: Manages collage-related endpoints
  - `images_controller.py`: Handles image upload and management endpoints
  - `schools_controller.py`: Manages school-related endpoints
  - `videos_controller.py`: Handles video generation and export endpoints
- **`app/services/`**: Business logic layer
  - `accounts_service.py`: User account and authentication logic
  - `collage_service.py`: Manages collage creation from uploaded images
  - `image_service.py`: Handles image operations and management
  - `image_processor.py`: Image processing and manipulation utilities
  - `video_service.py`: Handles video generation from collages
  - `export_service.py`: Manages video export functionality
  - `schools_service.py`: School data and operations logic
- **`app/persistence/`**: Data access layer
  - `database/session.py`: SQLAlchemy database session configuration
  - `models/`: Database models
    - `generated_collage_model.py`: Collage data model
  - `repositories/`: Data access objects for database operations
    - `accounts_repository.py`: User account data operations
    - `collages_repository.py`: Collage data operations
    - `images_repository.py`: Image data operations
    - `schools_repository.py`: School data operations
    - `videos_repository.py`: Video data operations
- **`app/dtos/`**: Data Transfer Objects for API requests/responses
  - `upload_dto.py`: Structure for uploaded images data
  - `video_dto.py`: Structure for video data
- **`app/core/`**: Core application configuration and utilities
  - `config.py`: Application configuration and settings management
  - `db.py`: Database connection and initialization
  - `deps.py`: Dependency injection utilities
  - `security.py`: Authentication and security utilities
- **`app/domain/`**: Domain models and business logic
- **`app/assets/`**: Static assets and resources
- **`media/`**: Storage for generated collages and SVG assets
  - `collages/`: Generated collage files
  - `svg/`: SVG and vector assets

### Frontend (GLOW-frontend)
The frontend is a React application built with Vite and TypeScript:

- **`src/main.tsx`**: Application entry point
- **`src/App.css`**: Global application styles
- **`src/index.css`**: Base styles
- **`src/vite-env.d.ts`**: Vite environment type definitions
- **`src/app/`**: Application-level components and routing
  - `router.tsx`: React Router configuration with routes for all features
  - `layout.tsx`: Main layout component with header
- **`src/features/`**: Feature modules
  - **`accounts/`**: Authentication and user management
    - `AdminLogin.tsx`: Admin login page
    - `UserLogin.tsx`: User login page
    - `StudentRegister.tsx`: Student registration page
    - `UserRoleSelection.tsx`: Role selection page
  - **`collage-generator/`**: Main collage generation workflow
    - **`pages/`**: Page components for each step
      - `Homepage.tsx`: Main landing page
      - `ImagesUploadPage.tsx`: Upload images interface
      - `ImagesReviewPage.tsx`: Review uploaded images
      - `CollageEditorPage.tsx`: Edit collage composition
      - `CollageReviewExportPage.tsx`: Review and export final collage
      - `GuidebookPage.tsx`: User guidebook
      - `MyVideosPage.tsx`: User's generated videos
      - `StudentCollagesPage.tsx`: Student collages view
      - `StudentCutoutPage.tsx`: Student cutout management
      - `StudentHomePage.tsx`: Student home page
      - `StudentProfilePage.tsx`: Student profile
      - `TeacherDiscoveryPage.tsx`: Teacher discovery page
      - `TeacherProfilePage.tsx`: Teacher profile
    - **`css/`**: Feature-specific styles
      - `HomePage.css`: Homepage styles
- **`src/shared/`**: Shared code across features
  - **`components/`**: Reusable UI components
    - `BottomNavBar.tsx`: Navigation bar for general users
    - `StudentBottomNavBar.tsx`: Navigation bar for students
    - `CameraCapture.tsx`: Camera capture component
    - `MagicLoader.tsx`: Loading spinner component
    - `MagicLoader.css`: Loader styles
    - `Logout.ts`: Logout functionality
  - **`services/`**: Shared API and business logic services
    - `api.ts`: Axios configuration for API calls
    - `authFetch.ts`: Authenticated fetch wrapper
    - `accountService.ts`: User account operations
    - `schoolService.ts`: School data operations
    - `videoService.ts`: Video-related operations
  - **`lib/`**: Utility functions
    - `validateCutout.ts`: Validation for cutout images
  - **`types/`**: Shared TypeScript type definitions
    - `Role.ts`: User role types
    - `School.ts`: School data types
- **`src/assets/`**: Static assets and resources
- **`public/`**: Public static files
  - `turn.min.js`: Turn.js library for page flipping
  - `roles/`: Role-related assets

## Dependencies Explanation

### Backend Dependencies
**Core Framework & Server:**
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **Uvicorn**: ASGI server for running FastAPI applications
- **Starlette**: Lightweight ASGI framework (used by FastAPI)

**Database:**
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM) for database operations
- **PyMySQL**: Pure Python MySQL database driver
- **mysql-connector-python**: Official MySQL connector for Python

**Data Validation & Configuration:**
- **Pydantic**: Data validation and settings management using Python type annotations
- **Pydantic-settings**: Environment variables and settings management
- **annotated-types**: Type annotations for runtime validation

**Authentication & Security:**
- **bcrypt**: Secure password hashing
- **cryptography**: Cryptographic recipes and primitives
- **PyJWT**: JSON Web Token implementation
- **python-jose**: JOSE (JavaScript Object Signing and Encryption) implementation
- **passlib**: Password hashing library

**File & Upload Handling:**
- **python-multipart**: Multipart form data parsing for file uploads
- **python-dotenv**: Load environment variables from .env files

**Image Processing & Computer Vision:**
- **OpenCV** (`opencv-python`, `opencv-python-headless`): Computer vision library for image processing and analysis
- **Pillow**: Python Imaging Library for image manipulation
- **scikit-image**: Image processing algorithms
- **rembg**: Background removal for images using AI
- **CairoSVG**: SVG rendering engine

**Scientific Computing:**
- **NumPy**: Fundamental package for array computing and mathematical operations
- **SciPy**: Scientific computing and technical computing
- **pandas**: Data manipulation and analysis
- **scikit-learn**: Machine learning algorithms
- **Shapely**: Geometric operations and analysis

**Vector Graphics & SVG:**
- **svglib**: Read SVG files as Python objects
- **svgwrite**: Create SVG files from Python
- **cairocffi**: Python bindings for Cairo graphics library
- **cssselect2**: CSS selectors parsing

**Optical Character Recognition:**
- **easyocr**: Simple OCR for 80+ languages

**Deep Learning & ML Models:**
- **torch**: PyTorch machine learning framework
- **torchvision**: Computer vision models using PyTorch
- **onnxruntime**: ONNX runtime for model inference

**HTTP & Networking:**
- **httpx**: Modern HTTP client
- **requests**: HTTP library for Python
- **anyio**: Async I/O compatibility layer

**Authentication Backend:**
- **Supabase**: Backend-as-a-service for authentication and real-time features
- **supabase-auth**: Supabase authentication client
- **supabase-functions**: Supabase serverless functions
- **postgrest**: PostgREST client
- **realtime**: Real-time subscriptions
- **storage3**: Supabase storage client

**Rate Limiting:**
- **slowapi**: Rate limiting for FastAPI

**Utilities:**
- **PyYAML**: YAML parser and emitter
- **coloredlogs**: Colored logging output
- **rich**: Rich terminal formatting and progress bars
- **tqdm**: Progress bar library
- **protobuf**: Protocol Buffers serialization
- **filelock**: File locking mechanism
- **packaging**: Core utilities for Python packaging

### Frontend Dependencies
**Core Framework:**
- **React**: JavaScript library for building user interfaces
- **React DOM**: React rendering library for the web
- **React Router DOM**: Declarative routing for React applications

**Form Management & Validation:**
- **React Hook Form**: Performant, flexible forms with easy validation
- **@hookform/resolvers**: Resolvers for React Hook Form to work with validation libraries
- **Zod**: TypeScript-first schema declaration and validation library

**HTTP Client:**
- **Axios**: Promise-based HTTP client for API requests

**UI Utilities:**
- **clsx**: Utility for constructing conditional className strings

**Progressive Web App:**
- **vite-plugin-pwa**: Plugin for adding PWA (Progressive Web App) capabilities

**Styling:**
- **Tailwind CSS**: Utility-first CSS framework
- **@tailwindcss/postcss**: PostCSS plugin for Tailwind CSS
- **PostCSS**: CSS processor for transformations
- **Autoprefixer**: PostCSS plugin for vendor prefixes

### Development Dependencies (Frontend)
**Language & Type Support:**
- **TypeScript**: Typed superset of JavaScript
- **typescript-eslint**: TypeScript support for ESLint
- **@types/react**: Type definitions for React
- **@types/react-dom**: Type definitions for React DOM
- **@types/node**: Type definitions for Node.js
- **globals**: Global variable definitions for different environments

**Build Tools:**
- **Vite**: Fast build tool and development server
- **@vitejs/plugin-react**: Vite plugin for React with Fast Refresh

**Code Quality:**
- **ESLint**: Linting utility for JavaScript and TypeScript
- **eslint-plugin-react-hooks**: ESLint rules for React Hooks
- **eslint-plugin-react-refresh**: ESLint rules for React Fast Refresh
- **@eslint/js**: ESLint JavaScript rules configuration
- **Prettier**: Code formatter

## Troubleshooting
- Ensure all environment variables are set correctly in `.env` files
- Verify MySQL connection and database creation before starting the backend
- Check that ports 8000 (backend) and 5173 (frontend) are available
- For large backend dependencies (torch, torchvision), ensure sufficient disk space
- Run `npm install` and `pip install -r requirements.txt` if dependencies are missing
- On macOS/Linux, you may need to install system packages for image processing: `brew install cairo libpng libjpeg`