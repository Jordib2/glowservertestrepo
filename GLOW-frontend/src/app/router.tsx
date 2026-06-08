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
import { MyVideosPage } from "../features/collage-generator/pages/MyVideosPage";;
import GuidebookPage from "../features/collage-generator/pages/GuidebookPage.tsx";

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
                element: <CollageEditorPage />
            },
            {
                path: "review-export-collage",
                element: <CollageReviewExportPage />
            },
            {
                path: "guidebook",
                element: <GuidebookPage />
            },
            {
                path: "image-upload",
                element: <ImagesUploadPage /> 
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
                element: <TeacherDiscoveryPage />
            },
            {
                path: "teacher-profile",
                element: <TeacherProfilePage />
            },
            {
                path: "my-videos",
                element: <MyVideosPage />
            }
    
        ]
    }
]);