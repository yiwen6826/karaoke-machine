import { useEffect, useState } from 'react';
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../firebase.ts";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../auth/AuthUserProvider.tsx';
import axios from 'axios';

const API_URL = "http://localhost:8080/api";

const ThumbnailGrid = ({ folderPath }: { folderPath : string}) => {
  const [urls, setUrls] = useState<string[]>([]);
  const navigate = useNavigate();
  const {user} = useAuth();

  const handleThumbnailClick = async (url : string) => {
    try {
      const urlObj = new URL(url);
      const vidPath = decodeURIComponent(urlObj.pathname);

      const imageId = vidPath.split('/').pop() || "";
      const songId = imageId.replace(/\.(jpg|jpeg)$/i, "");
      navigate('/sing');

      if (user?.uid) await axios.post(API_URL+"/queue/", {songId: songId, uid: user?.uid});
      else alert("Guest users must queue manually");

      navigate('/sing');
    } catch (e: any) {
      console.error("Error adding song to queue", e);
    }
  }

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const folderRef = ref(storage, folderPath);
        const result = await listAll(folderRef);
        const urls = await Promise.all(result.items.map(itemRef => getDownloadURL(itemRef)))
        setUrls(urls);
      } catch (e) {
        console.error("Image not found:", e);
      }
    };

    if (folderPath) fetchUrls();
  }, [folderPath]);

  return (
    <div className='grid-container'>
      {urls.map((url, index) => (
        <button key={index} className="thumbnail-btn" onClick={() => handleThumbnailClick(url)}>
          <img src={url} alt={`Thumbnail ${index}`} />
        </button>
      ))}
    </div>
  );
};


export default ThumbnailGrid;