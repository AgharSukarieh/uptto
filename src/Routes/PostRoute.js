import React from "react";
import { Route } from "react-router-dom";
import PostDetails from "../Pages/Posts/User/Post";
import ProtectedRoute from "./Auth/ProtectedRoute";

export const PostRoutes = (
  <>
    <Route 
      path="/Post/:id" 
      element={
        <ProtectedRoute>
          <PostDetails />
        </ProtectedRoute>
      } 
    />
  </>
);

