import { useEffect, useState } from 'react';
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.ts";

const VideoPlayer = ({ videoPath,  handleVidEnded }: { videoPath: string, handleVidEnded: () => void }) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const fileRef = ref(storage, videoPath);
        const downloadUrl = await getDownloadURL(fileRef);
        setUrl(downloadUrl);
      } catch (e) {
        console.error("Video not found:", e);
      }
    };

    if (videoPath) fetchUrl();
  }, [videoPath]);

  return (
    <video key={url} controls autoPlay width="100%" onEnded={handleVidEnded}>
      <source src={url} type="video/mp4" />
    </video>
  );
};

export default VideoPlayer;