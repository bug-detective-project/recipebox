import { Route, Routes } from 'react-router';
import { Footer } from './components/Footer.tsx';
import { Header } from './components/Header.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { RecipeFormPage } from './pages/RecipeFormPage.tsx';
import { RecipePage } from './pages/RecipePage.tsx';
import { RecipesPage } from './pages/RecipesPage.tsx';

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-content">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<RecipesPage />} />
          <Route path="/recipes/new" element={<RecipeFormPage />} />
          <Route path="/recipes/:id" element={<RecipePage />} />
          <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
