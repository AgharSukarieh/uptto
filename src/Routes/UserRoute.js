import React from "react";
import { Route } from "react-router-dom";
import UserProfile from "../Pages/User/UserProfile";
import ContestProblems from "../Pages/Contest/VeiwContest";
import ProtectedRoute from "./Auth/ProtectedRoute";

export const UserRoutes = (
  <>
    <Route 
      path="/Profile/:id" 
      element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } 
    />
    <Route path="/ViewContest/:id" element={<ContestProblems />}  />
  </>
);
