import { useState } from 'react';

const Queue = () => {
    const [data] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
    const [searchTerm, setSearchTerm] = useState('');
    const [queue, setQueue] = useState<string[]>([]);

    // TODO: Filter items based on search input
    const filteredItems = data.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add item to queue
    const enqueue = (item: string) => {
        setQueue(queue => [...queue, item]);
    };

    return (
        <div id="detail">
        <div className='search-container'>
        <input
            type="text"
            placeholder="Search for a song!"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='neon-input'
        />
        
        <ul>
            {searchTerm !== '' && filteredItems.map(item => (
            <li key={item}>
                {item} <button onClick={() => enqueue(item)}>Add</button>
            </li>
            ))}
        </ul>
        </div>

        <div className='queue-container'>
        <h2>Up Next:</h2>
        <ul className='queue-list'>
            {queue.map((item, index) => 
            <li key={index}>{item}
                <button onClick={() => setQueue(queue.filter((_, i) => i !== index))}>
                Remove {/*TODO: ADD API DELETE*/}
                </button>
            </li>)}
        </ul>
        </div>
        </div>
    );
};

export default Queue;