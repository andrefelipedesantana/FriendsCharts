import { getTopArtists } from "@/services/top-artists.service";
import { users } from "@/constants";

export async function GET(){

    try{
        const rankingArtists: Record<string, number> = {};

        const results = await Promise.all(
            users.map(user => getTopArtists(user))
        );


        for(const artists of results){
            for(const artist of artists){
                const name = artist.name;
                const plays = Number(artist.playcount) || 0;

                rankingArtists[name] = (rankingArtists[name] || 0) + plays;
            }
        }

        const sorted = Object.entries(rankingArtists)
        .map(([name, playcount]) => ({name, playcount}))
        .sort((a, b) => b.playcount - a.playcount);

        return Response.json({
            artists: sorted.slice(0, 5)
        })
    } catch(error){
        console.log(error);

        return Response.json(
            { error: "Erro ao buscar dados" },
            { status: 500 }
        );
    }
    
}