import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Vision from "./pages/Vision";
import Services from "./pages/Services";
import Recordings from "./pages/services/Recordings";
import Commands from "./pages/services/Commands";
import STT from "./pages/services/STT";
import Learn from "./pages/Learn";
import RecordingDetail from "./pages/RecordingDetail";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Vision />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/recordings" element={<Recordings />} />
        <Route path="/services/commands" element={<Commands />} />
        <Route path="/services/stt" element={<STT />} />
        <Route path="/recordings/:id" element={<RecordingDetail />} />
        <Route path="/learn" element={<Learn />} />
      </Route>
    </Routes>
  );
}

export default App;
