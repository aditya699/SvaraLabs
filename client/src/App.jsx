import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import RecordingDetail from "./pages/RecordingDetail";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/recordings/:id" element={<RecordingDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
