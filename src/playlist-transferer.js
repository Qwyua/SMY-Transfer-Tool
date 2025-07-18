// YouTube Music Playlist Processor
// Paste this AFTER pasting the playlists array

async function getAuthHeaders() {
    const SAPISID = document.cookie.split('; ').find(c => c.startsWith('SAPISID='));
    if (!SAPISID) throw new Error("SAPISID not found - please log in to YouTube Music first");
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

async function searchYoutubeMusic(query) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch("https://music.youtube.com/youtubei/v1/search?prettyPrint=false", {
        method: "POST",
        headers: {
            ...authHeaders,
            "content-type": "application/json",
            "x-youtube-client-name": "67",
            "x-youtube-client-version": "1.20250709.03.01"
        },
        body: JSON.stringify({
            context: {
                client: { hl: "en", gl: "US", clientName: "WEB_REMIX", clientVersion: "1" }
            },
            query
        })
    });

    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    const json = await response.json();
    const videoId = findFirstVideoId(json);
    if (!videoId) throw new Error(`No results found for "${query}"`);
    return videoId;
}

function findFirstVideoId(obj) {
    if (obj?.watchEndpoint?.videoId) return obj.watchEndpoint.videoId;
    if (typeof obj === 'object') {
        for (const key in obj) {
            const result = findFirstVideoId(obj[key]);
            if (result) return result;
        }
    }
    return null;
}

async function createPlaylist(title, videoIds) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch("https://music.youtube.com/youtubei/v1/playlist/create?prettyPrint=false", {
        method: "POST",
        headers: {
            ...authHeaders,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            context: { client: { clientName: "WEB_REMIX", clientVersion: "1" } },
            title,
            privacyStatus: "PRIVATE",
            videoIds
        })
    });
    return await response.json();
}

async function processPlaylists() {
    if (!window.playlists) {
        console.error("No playlists found. Did you paste the playlist data first?");
        return;
    }

    for (const playlist of playlists) {
        try {
            console.log(`Processing "${playlist.name}"...`);
            const videoIds = [];
            
            for (const song of playlist.songs) {
                try {
                    const videoId = await searchYoutubeMusic(song);
                    videoIds.push(videoId);
                    console.log(`✓ Found: ${song}`);
                } catch (e) {
                    console.warn(`✗ Failed to find: ${song} - ${e.message}`);
                }
            }

            if (videoIds.length > 0) {
                const result = await createPlaylist(playlist.name, videoIds);
                console.log(`Successfully created playlist: ${playlist.name}`, result);
            } else {
                console.warn(`Skipping "${playlist.name}" - no valid songs found`);
            }
        } catch (e) {
            console.error(`Failed to process "${playlist.name}":`, e);
        }
    }
}

// test1234
function addHelperButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Process Playlists';
    btn.style = 'position:fixed;bottom:20px;right:20px;z-index:9999;padding:10px;background:#f00;color:white;border:none;border-radius:4px;';
    btn.onclick = processPlaylists;
    document.body.appendChild(btn);
    console.log('Click the red button in bottom-right to start processing');
}

addHelperButton();
