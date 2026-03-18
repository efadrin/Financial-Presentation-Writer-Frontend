import React, { lazy, Suspense } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { UserInfoValidationWrapper } from "./components/userInfo/UserInfoValidationWrapper";
import { AppLayout } from "./components/layout/AppLayout";
import LoadingFallback from "./components/common/LoadingFallback";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";

const DocumentsView = lazy(() => import("./views/DocumentsView"));
const DocumentWorkflowPage = lazy(() => import("./views/DocumentWorkflowPage"));

const router = createHashRouter([
  {
    path: "/",
    element: (
      <UserInfoValidationWrapper>
        <AppLayout />
      </UserInfoValidationWrapper>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DocumentsView />
          </Suspense>
        ),
      },
      {
        path: "documents",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DocumentsView />
          </Suspense>
        ),
      },
      {
        path: "document-workflow",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DocumentWorkflowPage />
          </Suspense>
        ),
      },
    ],
  },
]);

const Routing: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Routing;
