import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { 
  Container, Typography, CircularProgress, Card, CardContent, Link, 
  List, ListItem, Button, Grid, Box 
} from "@mui/material";

const TorrentDetails = () => {
  const { provider, encodedLink } = useParams();
  const [torrentData, setTorrentData] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [posterFrames, setPosterFrames] = useState([]);
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const hiddenVideoRef = useRef(null);

  useEffect(() => {
    const fetchTorrentDetails = async () => {
      setLoading(true);
      try {
        const apiUrl = `https://python-alltorrent.onrender.com/get/${provider}?link=${encodedLink}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        const torrent = data.data || {};
        setTorrentData(torrent);

        if (torrent?.magnet) {
          const filesResponse = await fetch(`https://webtorrent-stream.onrender.com/list-files/${encodeURIComponent(torrent.magnet)}`);
          const filesData = await filesResponse.json();
          
          if (filesData.error) {
            setError(filesData.error);
          } else {
            setFiles(filesData);

            const videoFile = filesData.find(file => file.type === "video");
            if (videoFile) {
              const fileUrl = `https://webtorrent-stream.onrender.com/stream/${encodeURIComponent(torrent.magnet)}/${encodeURIComponent(videoFile.name)}`;
              setVideoSrc(fileUrl);
              generateSlideshowFrames(fileUrl);
            }
          }
        }
      } catch (err) {
        setError("Failed to fetch torrent details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTorrentDetails();
  }, [provider, encodedLink]);

  const generateSlideshowFrames = (videoUrl) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.play();

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 270;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");

      let frames = [];
      let seekTimes = [22, 66, 77, 88, 99, 200, 250, 300];

      let index = 0;
      const captureFrame = () => {
        if (index >= seekTimes.length) {
          setPosterFrames(frames);
          video.pause();
          return;
        }
        video.currentTime = seekTimes[index];
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL("image/png"));
          index++;
          captureFrame();
        };
      };

      captureFrame();
    };
  };

  useEffect(() => {
    if (posterFrames.length > 1) {
      const interval = setInterval(() => {
        setCurrentPosterIndex(prevIndex => (prevIndex + 1) % posterFrames.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [posterFrames]);

  const handlePlayVideo = (fileUrl) => {
    setVideoSrc(fileUrl);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="80vh"><CircularProgress /></Box>;
  if (error) return <Typography color="error" textAlign="center">{error}</Typography>;
  if (!torrentData) return <Typography textAlign="center">No details found.</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom textAlign="center">
        🎬 Movie Details
      </Typography>

      <Grid container spacing={4} alignItems="center">
        {/* Left Side: Movie Poster */}
        <Grid item xs={12} md={4} textAlign="center">
          {posterFrames.length > 0 ? (
            <img 
              src={posterFrames[currentPosterIndex]} 
              width="100%" 
              height="450px" 
              style={{ borderRadius: "10px", objectFit: "cover" }} 
              alt="Movie Poster" 
            />
          ) : (
            <Typography>Loading poster...</Typography>
          )}
        </Grid>

        {/* Right Side: Movie Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="body1">
                <strong>Magnet Link:</strong>{" "}
                <Link href={torrentData?.magnet} target="_blank" rel="noopener noreferrer">
                  Click to Open in Torrent App
                </Link>
              </Typography>

              <Typography variant="body1" mt={2}>
                <strong>Download Torrent File:</strong>{" "}
                <Link href={torrentData?.torrent_file} target="_blank" rel="noopener noreferrer">
                  Click to Download
                </Link>
              </Typography>

              {/* Scrollable File List */}
              <Typography variant="h6" mt={3}>
                📂 Available Files:
              </Typography>
              <Box sx={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", borderRadius: "5px", padding: "10px", mt: 2 }}>
                <List>
                  {files.length > 0 ? (
                    files.map((file, index) => (
                      <ListItem key={index}>
                        {file.type === "video" ? "🎥" : "📄"} {file.name} ({(file.length / 1024 / 1024).toFixed(2)} MB)
                        {file.type === "video" && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ ml: 2 }}
                            onClick={() =>
                              handlePlayVideo(
                                `https://webtorrent-stream.onrender.com/stream/${encodeURIComponent(torrentData?.magnet)}/${encodeURIComponent(file.name)}`
                              )
                            }
                          >
                            {isPlaying && videoSrc.includes(file.name) ? "Pause" : "Play"}
                          </Button>
                        )}
                      </ListItem>
                    ))
                  ) : (
                    <Typography>No files found in the torrent.</Typography>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Gallery */}
      {posterFrames.length > 0 && (
        <Box mt={5} textAlign="center">
          <Typography variant="h6">📸 Gallery of Video Frames</Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mt={2}>
            {posterFrames.map((frame, index) => (
              <img 
                key={index} 
                src={frame} 
                width="120px" 
                height="170px"
                style={{ borderRadius: "5px", cursor: "pointer", objectFit: "cover" }}
                alt={`Frame ${index}`} 
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Video Player */}
      {isPlaying && (
        <Box mt={4} textAlign="center">
          <video 
            ref={videoRef}
            src={videoSrc} 
            width="100%" 
            controls 
            autoPlay 
            style={{ borderRadius: "10px" }}
          />
        </Box>
      )}

      <video ref={hiddenVideoRef} style={{ display: "none" }} muted />
    </Container>
  );
};

export default TorrentDetails;
