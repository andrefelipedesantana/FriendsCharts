import axios from 'axios';
import { API_KEY } from '@/constants';

export async function getTopAlbums(user: string){
    const res = await axios.get("https://ws.audioscrobbler.com/2.0/",{
        params: {
            method: "user.gettopalbums",
            user,
            api_key: API_KEY,
            period: "7day",
            limit: 300,
            format: "json",
        },
    });

    return res.data.topalbums.album;
}