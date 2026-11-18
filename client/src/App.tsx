import { Route, Routes } from 'react-router';
import { Header } from './components/Header.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { RecipeFormPage } from './pages/RecipeFormPage.tsx';
import { RecipePage } from './pages/RecipePage.tsx';
import { RecipesPage } from './pages/RecipesPage.tsx';

export function App() {
  return (
    <div className="min-h-screen bg-surface text-content">
      <Header />
      <Routes>
        <Route path="/" element={<RecipesPage />} />
        <Route path="/recipes/new" element={<RecipeFormPage />} />
        <Route path="/recipes/:id" element={<RecipePage />} />
        <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
