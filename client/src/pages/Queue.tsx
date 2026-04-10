import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080/api";
interface Video {
    id: string,
    video_url: string,
    priority: number,
}


const Queue = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Video[]>([]);
    const [queue, setQueue] = useState<string[]>([]);

    useEffect(() => {
        fetchQueue();
    }, []);

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
    }

    const fetchQueue = async () => {
        const response = await axios.get(API_URL + "/queue");
        setQueue(response.data);
    }

    const enqueue = async (song: Video) => {
        try {
            await axios.post(API_URL+"/queue", {songId: song.id});

            setSearchTerm('');
            setSearchResults([]);
            fetchQueue();
        } catch (e: any) {
            alert("Error adding song to queue");
        }
    };

    const handleRemove = async (queueId: number) => {
        try {
            await axios.delete(API_URL+"/queue/"+queueId);

            fetchQueue();
        } catch (e: any) {
            console.error("Could not remove song", e);
        }
    }

    return (
        <div id="detail">
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
        <ul className='queue-list'>
            {queue.map((item: any) => 
            <li key={item.queueId}>
                <button onClick={() => handleRemove(item.queueId)}>
                Remove
                </button>
            </li>)}
        </ul>
        </div>
        </div>
    );
};

export default Queue;