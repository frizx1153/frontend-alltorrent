import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchAllTorrent from "./components/SearchAllTorrent";
import TorrentDetails from "./components/TorrentDetails";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchAllTorrent />} />
        <Route path="/torrent/:provider/:encodedLink" element={<TorrentDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
