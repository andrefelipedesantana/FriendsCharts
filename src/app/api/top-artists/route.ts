import { getTopArtists } from "@/services/top-artists.service";
import { users } from "@/constants";

export const dynamic = 'force-dynamic';

export async function GET() {

    try {
        const rankingArtists: Record<string, { playcount: number; topListener?: string; topListenerPlays?: number }> = {};

        const results = await Promise.all(
            users.map(async (user) => ({
                user,
                artists: await getTopArtists(user)
            }))
        );

        for (const result of results) {
            const { user, artists } = result;
            for (const artist of artists) {
                const name = artist.name;
                const plays = Number(artist.playcount) || 0;

                if (!rankingArtists[name]) {
                    rankingArtists[name] = {
                        playcount: 0,
                        topListener: user,
                        topListenerPlays: plays
                    };
                }

                rankingArtists[name].playcount += plays;

                if (plays > (rankingArtists[name].topListenerPlays || 0)) {
                    rankingArtists[name].topListener = user;
                    rankingArtists[name].topListenerPlays = plays;
                }
            }
        }

        const sorted = Object.entries(rankingArtists)
            .map(([name, data]) => ({ 
                name, 
                playcount: data.playcount,
                topListener: data.topListener
            }))
            .sort((a, b) => b.playcount - a.playcount);

        return Response.json({
            artists: sorted.slice(0, 10)
        })
    } catch (error) {
        console.log(error);

        return Response.json(
            { error: "Erro ao buscar dados" },
            { status: 500 }
        );
    }

}