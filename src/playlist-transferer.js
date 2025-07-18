// YouTube Music Playlist Processor
// Paste this AFTER pasting the playlists array

async function getAuthHeaders() {
    const SAPISID = document.cookie.split('; ').find(c => c.startsWith('SAPISID='));
    if (!SAPISID) throw new Error("SAPISID not found, you need to log in.");
    const sapisidValue = SAPISID.split('=')[1];
    const origin = 'https://music.youtube.com';
    const timestamp = Math.floor(Date.now() / 1000);
    const input = `${timestamp} ${sapisidValue} ${origin}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
        "authorization": `SAPISIDHASH ${timestamp}_${hashHex}`,
        "x-origin": origin
    };
}

// ✅ Find first videoId in object
function findFirstVideoId(obj) {
    if (typeof obj !== 'object' || obj === null) return null;
    if (obj.watchEndpoint?.videoId) return obj.watchEndpoint.videoId;
    for (const key in obj) {
        const result = findFirstVideoId(obj[key]);
        if (result) return result;
    }
    return null;
}

// ✅ Search for videoId by song
async function searchYoutubeMusic(query) {
    const authHeaders = await getAuthHeaders();

    const response = await fetch("https://music.youtube.com/youtubei/v1/search?prettyPrint=false", {
        method: "POST",
        headers: {
            ...authHeaders,
            "accept": "*/*",
            "content-type": "application/json",
            "x-youtube-client-name": "67",
            "x-youtube-client-version": "1.20250709.03.01"
        },
        credentials: "include",
        body: JSON.stringify({
            context: {
                client: { hl: "tr", gl: "TR", clientName: "WEB_REMIX", clientVersion: "1.20250709.03.01" }
            },
            query
        })
    });

    if (!response.ok) throw new Error(`Search Error: ${response.status}`);
    const json = await response.json();
    const firstVideoId = findFirstVideoId(json);

    if (!firstVideoId) throw new Error(`"${query}" not found: videoId not found`);
    console.log(`Found videoId for "${query}": ${firstVideoId}`);
    return firstVideoId;
}

// ✅ Create playlist
async function createPlaylist(title, videoIds) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch("https://music.youtube.com/youtubei/v1/playlist/create?prettyPrint=false", {
        method: "POST",
        headers: {
            ...authHeaders,
            "content-type": "application/json",
            "x-youtube-client-name": "67",
            "x-youtube-client-version": "1.20250709.03.01"
        },
        credentials: "include",
        body: JSON.stringify({
            context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20250709.03.01", hl: "tr", gl: "TR" } },
            title,
            privacyStatus: "UNLISTED",
            videoIds
        })
    });

    if (!response.ok) throw new Error(`Create Error: ${response.status}`);
    const json = await response.json();
    console.log(`Playlist created: ${title}`, json);
    return json;
}

// ✅ Full process: search ➡ videoId ➡ playlist
async function startProcess(data) {
    const title = data.title;
    const content = data.songs;
    const videoIds = [];

    for (const query of content) {
        try {
            const videoId = await searchYoutubeMusic(query);
            videoIds.push(videoId);
        } catch (err) {
            console.error(`"${query}" not found:`, err.message);
        }
    }

    if (videoIds.length === 0) throw new Error("No videoIds found.");
    await createPlaylist(title, videoIds);
}

// Process all playlists
async function processPlaylists() {
    for (const playlist of window.playlists) {
        try {
            await startProcess({
                title: playlist.name,
                songs: playlist.songs
            });
        } catch (err) {
            console.error(`Error processing "${playlist.name}":`, err.message);
        }
    }
}

// Start processing all playlists
processPlaylists().catch(console.error);
