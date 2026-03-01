import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RecipeLibrary from './pages/RecipeLibrary'
import RecipeDetail from './pages/RecipeDetail'
import Dashboard from './pages/Dashboard'
import MealCalculator from './pages/MealCalculator'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage initialMode="signup" />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/recipes" element={
        <ProtectedRoute><RecipeLibrary /></ProtectedRoute>
      } />
      <Route path="/recipes/:id" element={
        <ProtectedRoute><RecipeDetail /></ProtectedRoute>
      } />
      <Route path="/calculator" element={
        <ProtectedRoute><MealCalculator /></ProtectedRoute>
      } />
    </Routes>
  )
}

export default App