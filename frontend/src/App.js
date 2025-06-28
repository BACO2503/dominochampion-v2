import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadCSV from "./UploadCSV";
import ParticipantesDomino from "./ParticipantesDomino";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ParticipantesDomino />} />
      </Routes>
    </Router>
  );
}

export default App;
