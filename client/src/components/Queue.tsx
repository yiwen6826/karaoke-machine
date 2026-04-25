import { useEffect, useState } from 'react';
import { CircleArrowUp } from 'lucide-react';
import { CircleX } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import { useAuth } from "../auth/AuthUserProvider";

const API_URL = "http://localhost:8080/api";
interface qEntry {
    qid: number,
    songId: string,
    url: string,
    priority: number,
}

interface Video {
    id: string,
    video_url: string,
    priority: number,
}

const Queue = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Video[]>([]);
    const [queue, setQueue] = useState<qEntry[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setQueue([]);
            setSearchResults([]);
        }
        fetchQueue();
    }, [user]);

    const handleSearch = async(term: string) => {
        setSearchTerm(term);

        if (term.length > 1) {
            try {
                const response = await axios.get(API_URL+`/search?q=${term}`);
                setSearchResults(response.data);
            } catch (e: any) {
                console.error("Search error:", e);
            }
        }
        else {
            setSearchResults([]);
        }

        fetchQueue();
    }

    const fetchQueue = async () => {
        if (!user?.uid) return;
        const response = await axios.get(API_URL + "/queue/" + user?.uid);
        setQueue(response.data);
    }

    const enqueue = async (song: Video) => {
        const newEntry: qEntry = {
            qid: Date.now(),
            songId: song.id,
            url: song.video_url,
            priority: queue.length
        }
        if (!user?.uid) {
            setQueue([...queue, newEntry]);
            setSearchTerm('');
            setSearchResults([]);
            
        }
        else {
            try {
                await axios.post(API_URL+"/queue/", {songId: song.id, uid: user?.uid});

                setSearchTerm('');
                setSearchResults([]);
                fetchQueue();
            } catch (e: any) {
                alert("Error adding song to queue");
            }
        }
    };

    const handleRemove = async (queueId: number) => {
        if (!user?.uid) {
            setQueue(queue.filter((song) => song.qid != queueId));
            setSearchTerm('');
            setSearchResults([]);
            fetchQueue();
        }
        try {
            await axios.delete(API_URL+"/queue/"+queueId+"/"+user?.uid);

            fetchQueue();
        } catch (e: any) {
            console.error("Could not remove song", e);
        }
    }

    const handlePrioritize = async (queueId: number) => {
        if (!user?.uid) {
            const songIdx: number = queue.findIndex((song) => song.qid === queueId);
            if (songIdx <= 0) {
                console.error("Could not prioritize song");
                return;
            }
            const newQueue = [...queue];
            [newQueue[songIdx], newQueue[songIdx-1]] = [newQueue[songIdx-1], newQueue[songIdx]];
            setQueue(newQueue);
            setSearchTerm('');
            setSearchResults([]);
            fetchQueue();
        }
        else {
            try {
                await axios.put(API_URL+"/queue/"+queueId+"/"+user?.uid);

                fetchQueue();
            } catch (e: any) {
                console.error("Could not prioritize song", e);
            }
        }
    }

    return (
        <div id="detail">
            {
                queue.length > 0 && (
                    <div className='video-container'>
                        <VideoPlayer
                        videoPath={queue[0].url}
                        />
                    <h2>Now Playing: {queue[0].songId.replace(/-/g, ' ')}</h2>
                    </div>
                )
            }
        <div className='search-container'>
        <input
            type="text"
            placeholder="Search for a song!"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className='neon-input'
        />
        
        <ul className='results-list'>
            {searchResults.map(song => (
                <li key={song.id}>
                    <span>{song.id.replace(/-/g, ' ')}</span> 
                    <button onClick={() => enqueue(song)}>Add</button>
                </li>
            ))}
        </ul>
        </div>

        <div className='queue-container'>
        <h2>Up Next:</h2>
        <h2>{queue.length == 0 ? 'Nothing here yet!' : ''}</h2>
        <ul className='queue-list'>
            {queue.map((item: any) => 
            <li key={item.qid}>
            <span>{item.songId.replace(/-/g, ' ')}</span> 
            <div className='icon-container'>
                <button onClick={() => handleRemove(item.qid)}
                data-tooltip-id='remove' 
                data-tooltip-content='Remove song from queue'> 
                    <CircleX/>
                </button>
                <Tooltip id="remove" />

                <button onClick={() => handlePrioritize(item.qid)} 
                data-tooltip-id='prioritize' 
                data-tooltip-content='Move song up in queue'> 
                    <CircleArrowUp/>
                </button>
                <Tooltip id="prioritize" />
            </div>
            </li>)}
        </ul>
        </div>
        </div>
    );
};

export default Queue;