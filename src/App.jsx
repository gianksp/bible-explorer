import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BibleReader from './pages/BibleReader.jsx'
import SearchResults from './pages/SearchResults.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BibleReader />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
