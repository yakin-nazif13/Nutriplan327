import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RecipeLibrary from './pages/RecipeLibrary'
import RecipeDetail from './pages/RecipeDetail'
import Dashboard from './pages/Dashboard'
import MealCalculator from './pages/MealCalculator'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage initialMode="signup" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/recipes" element={<RecipeLibrary />} />
      <Route path="/recipes/:id" element={<RecipeDetail />} />
      <Route path="/calculator" element={<MealCalculator />} />
    </Routes>
  )
}

export default App