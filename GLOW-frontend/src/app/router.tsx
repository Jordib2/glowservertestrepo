import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout.tsx";

import ImagesUploadPage from "../features/collage-generator/pages/ImagesUploadPage.tsx";
import ImagesReviewPage from "../features/collage-generator/pages/ImagesReviewPage.tsx";
import CollageEditorPage from "../features/collage-generator/pages/CollageEditorPage.tsx";
import CollageReviewExportPage from "../features/collage-generator/pages/CollageReviewExportPage.tsx";
import UserRoleSelection from "../features/accounts/UserRoleSelection.tsx";
import UserLogin from "../features/accounts/UserLogin.tsx";
import TeacherDiscoveryPage from "../features/collage-generator/pages/TeacherDiscoveryPage.tsx";
import TeacherProfilePage from "../features/collage-generator/pages/TeacherProfilePage.tsx";
import { MyVideosPage } from "../features/collage-generator/pages/MyVideosPage";
import StudentRegister from "../features/accounts/StudentRegister.tsx";
import GuidebookPage from "../features/collage-generator/pages/GuidebookPage.tsx";
import StudentHomePage from "../features/collage-generator/pages/StudentHomePage.tsx";
import StudentProfilePage from "../features/collage-generator/pages/StudentProfilePage.tsx";
import StudentCutoutPage from "../features/collage-generator/pages/StudentCutoutPage.tsx";
import StudentCollagesPage from "../features/collage-generator/pages/StudentCollagesPage.tsx";
import ProtectedRoute from "../shared/components/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { 
                index: true,
                element: <UserRoleSelection /> 
            },
            {
                path: "review-images",
                element: <ImagesReviewPage />
            },
            {
                path: "collage-editor",
                element: <ProtectedRoute requiredRole="teacher"><CollageEditorPage /></ProtectedRoute>
            },
            {
                path: "review-export-collage",
                element: <ProtectedRoute requiredRole="teacher"><CollageReviewExportPage /></ProtectedRoute>
            },
            {
                path: "guidebook",
                element: <GuidebookPage />
            },
            {
                path: "image-upload",
                element: <ProtectedRoute requiredRole="teacher"><ImagesUploadPage /></ProtectedRoute>
            },
            {
                path: "user-role-selection",
                element: <UserRoleSelection />
            },
            {
                path: "user-login",
                element: <UserLogin />
            },
            {
                path: "teacher_discovery",
                element: <ProtectedRoute requiredRole="teacher"><TeacherDiscoveryPage /></ProtectedRoute>
            },
            {
                path: "teacher-profile",
                element: <ProtectedRoute requiredRole="teacher"><TeacherProfilePage /></ProtectedRoute>
            },
            {
                path: "my-videos",
                element: <ProtectedRoute requiredRole="teacher"><MyVideosPage /></ProtectedRoute>
            },
            {
                path: "student-register",
                element: <StudentRegister />
            },
            {

                path: "student-home",
                element: <StudentHomePage />
            },
            {
                path: "student-profile",
                element: <StudentProfilePage />
            },
            {
                path: "student-cutout",
                element: <StudentCutoutPage />
            },
            {
                path: "student-collages",
                element: <StudentCollagesPage />
            }
        ]
    }
]);