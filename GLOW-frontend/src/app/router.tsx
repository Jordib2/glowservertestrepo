import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout.tsx";

import ImagesUploadPage from "../features/collage-generator/pages/ImagesUploadPage.tsx";
import ImagesReviewPage from "../features/collage-generator/pages/ImagesReviewPage.tsx";
import CollageEditorPage from "../features/collage-generator/pages/CollageEditorPage.tsx";
import CollageReviewExportPage from "../features/collage-generator/pages/CollageReviewExportPage.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { 
                index: true,
                element: <ImagesUploadPage /> 
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
                path: "image-upload",
                element: <ImagesUploadPage /> 
            }
        ]
    }
]);