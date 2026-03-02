// SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Chat from "./pages/Chat";
import NewCollection from "./pages/NewCollection";
import Layout from "./components/layout/Layout";
import SettingsPage from "./pages/SettingsPage";
import { ToastContainer } from "./components/ui/ToastContainer";
import { useAppHealthStatus, useServerDefaultsInitialization } from "./store/useSettingsStore";
import { useHealthMonitoring } from "./hooks/useHealthMonitoring";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/Login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  useAppHealthStatus();
  useServerDefaultsInitialization();
  useHealthMonitoring();
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/collections/new" element={<NewCollection />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </QueryClientProvider>
    </AuthProvider>
  );
}
