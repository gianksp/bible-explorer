import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BibleView from './pages/BibleView.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BibleView />} />
        <Route path="/search" element={<BibleView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}