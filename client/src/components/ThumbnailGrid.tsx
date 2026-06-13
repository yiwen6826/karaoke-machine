import { useEffect, useState } from 'react';
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../firebase.ts";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../auth/AuthUserProvider.tsx';
import api from '../api';

//const API_URL = "http://localhost:8080/api";

const ThumbnailGrid = ({ folderPath }: { folderPath : string}) => {
  const [urls, setUrls] = useState<string[]>([]);
  const navigate = useNavigate();
  const {user} = useAuth();

  const [vidCount, setVidCount] = useState<number>(0);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const isFullyLoaded = urls.length > 0 && vidCount > 0 && loadedCount == vidCount;

  const handleThumbnailClick = async (url : string) => {
    try {
      const urlObj = new URL(url);
      const vidPath = decodeURIComponent(urlObj.pathname);

      const imageId = vidPath.split('/').pop() || "";
      const songId = imageId.replace(/\.(jpg|jpeg)$/i, "");

      if (user?.uid) {
        await api.post("/queue/", {songId: songId, uid: user?.uid})
        .then(res => {if (res.status == 201) navigate('/sing');});
      }
      else alert("Guest users must queue manually");

    } catch (e: any) {
      console.error("Error adding song to queue", e);
    }
  }

  const handleImageLoad = () => {
    setLoadedCount((prev) => prev+1);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vidCountResponse = await api.get("/vid-count");
        setVidCount(vidCountResponse.data);

        const folderRef = ref(storage, folderPath);
        const result = await listAll(folderRef);
        const urls = await Promise.all(result.items.map(itemRef => getDownloadURL(itemRef)))
        setUrls(urls);
      } catch (e) {
        console.error("Image not found:", e);
      }
    };

    if (folderPath) fetchData();
  }, [folderPath]);

  return (
    <div className='grid-wrapper'>
      {!isFullyLoaded && (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Tuning the Karaoke Machine...</p>
          <span className="loading-progress">
            {loadedCount} / {vidCount || '...'} Loaded
          </span>
        </div>
      )}

      <div className={`grid-container ${isFullyLoaded ? '' : 'hidden'}`}>
        {urls.map((url, index) => (
          <button 
            key={index} 
            className={user ? "thumbnail-btn" : "thumbnail"} 
            onClick={() => handleThumbnailClick(url)}
          >
            <img 
              src={url} 
              alt={`Thumbnail ${index}`} 
              onLoad={handleImageLoad}
              loading="eager"
            />
          </button>
        ))}
      </div>
    </div>
  );
};


export default ThumbnailGrid;