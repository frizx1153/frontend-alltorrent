import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const SearchAllTorrent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const apiEndpoints = {
    "1337x": "https://python-alltorrent.onrender.com/search/1337x",
    "Nyaa": "https://python-alltorrent.onrender.com/search/nyaa",
    "RARBG": "https://python-alltorrent.onrender.com/search/rarbg",
    "TPB": "https://python-alltorrent.onrender.com/search/tpb",
  };

  const handleSearch = async (source, page = 1) => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`${apiEndpoints[source]}?q=${query}&page=${page}&nsfw=true`);
      const data = await response.json();

      setResults(data.torrents || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (provider, link) => {
    const encodedLink = encodeURIComponent(link);
    navigate(`/torrent/${provider}/${encodedLink}`);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom align="center">
        Search Torrents
      </Typography>

      <TextField
        fullWidth
        label="Search for torrents..."
        variant="outlined"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        margin="normal"
      />

      <Grid container spacing={2} justifyContent="center" style={{ marginTop: 10 }}>
        {Object.keys(apiEndpoints).map((source) => (
          <Grid item key={source}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setCurrentPage(1);
                handleSearch(source, 1);
              }}
            >
              Search on {source}
            </Button>
          </Grid>
        ))}
      </Grid>

      {loading && <Typography align="center" style={{ marginTop: 20 }}>Loading...</Typography>}
      {error && <Typography color="error" align="center" style={{ marginTop: 20 }}>{error}</Typography>}

      <Grid container spacing={2} style={{ marginTop: 20 }}>
        {results.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card onClick={() => handleCardClick(item.provider, item.link)} style={{ cursor: "pointer" }}>
              <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2">Size: {item.size}</Typography>
                <Typography variant="body2">Seeds: {item.seeds} | Leeches: {item.leeches}</Typography>
                <Typography variant="body2">Uploader: {item.uploader}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SearchAllTorrent;
