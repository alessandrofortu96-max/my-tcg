import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SelectionProvider } from "@/contexts/SelectionContext";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "./pages/Home";
import Category from "./pages/Category";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Reviews from "./pages/Reviews";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminReviews from "./pages/AdminReviews";
import AdminProductForm from "./pages/AdminProductForm";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import NotaLegale from "./pages/NotaLegale";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SelectionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categoria/:game" element={<Category />} />
            <Route path="/prodotti" element={<ProductList />} />
            <Route path="/prodotto/:id" element={<ProductDetail />} />
            <Route path="/contatti" element={<Contact />} />
            <Route path="/recensioni" element={<Reviews />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Admin />} />
            <Route path="/dashboard/recensioni" element={<AdminReviews />} />
            <Route path="/dashboard/prodotti/nuovo" element={<AdminProductForm />} />
            <Route path="/dashboard/prodotti/:id/modifica" element={<AdminProductForm />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/nota-legale" element={<NotaLegale />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SelectionProvider>
  </QueryClientProvider>
);

export default App;
