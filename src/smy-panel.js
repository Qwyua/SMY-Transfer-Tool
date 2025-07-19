    const style = document.head.appendChild(document.createElement('style'));
    style.textContent = `.smy-panel-container{position:fixed;bottom:20px;right:20px;z-index:9999;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif}.smy-panel-toggle{width:50px;height:50px;background:linear-gradient(135deg,#6e8efb,#a777e3);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,.2);transition:.3s;border:none;outline:0;color:#fff;font-size:20px}.smy-panel{position:absolute;bottom:70px;right:0;width:350px;background:rgba(30,30,45,.95);border-radius:15px;box-shadow:0 10px 25px rgba(0,0,0,.3);overflow:hidden;display:none;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1)}.smy-panel.active{display:block}.smy-panel-header{padding:15px;background:linear-gradient(135deg,#6e8efb,#a777e3);color:#fff;display:flex;justify-content:space-between;align-items:center}.smy-panel-header h3{margin:0;font-size:16px;font-weight:600}.header-actions{display:flex;gap:10px}.smy-panel-content{padding:15px;height:270px;overflow-y:auto;overflow-x:hidden}.smy-panel-content::-webkit-scrollbar{width:8px}.smy-panel-content::-webkit-scrollbar-thumb{background:#b3b3b3;border-radius:4px}.playlist-item{padding:10px;margin-bottom:8px;background:rgba(255,255,255,.05);border-radius:8px;display:flex;align-items:center;justify-content:space-between;transition:.2s;cursor:pointer;border:1px solid transparent}.playlist-item:hover{background:rgba(255,255,255,.1)}.playlist-item.selected{border:1px solid #a777e3;background:rgba(167,119,227,.1)}.playlist-item.tracking{border-left:3px solid #6e8efb}.playlist-name{font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}.playlist-count{font-size:12px;color:#aaa;margin-left:10px}.copy-btn,.delete-btn{color:#fff;cursor:pointer;transition:.2s}.delete-btn{background:rgba(255,99,71,.3);border:none;padding:4px 7px;border-radius:5px;font-size:11px;margin-left:8px}.delete-btn:hover{background:rgba(255,99,71,.5)}.copy-btn{background:rgba(167,119,227,.3);border:none;padding:5px 10px;border-radius:5px;font-size:12px}.copy-btn:hover:not(:disabled){background:rgba(167,119,227,.5)}.copy-btn:disabled{opacity:.5;cursor:not-allowed;background:rgba(167,119,227,.2)}.status-indicator{font-size:10px;color:#6e8efb;margin-left:5px}@keyframes clickAnimation{0%,100%{transform:scale(1)}50%{transform:scale(.95)}}.click-effect{animation:.3s clickAnimation}.notification{position:fixed;bottom:90px;right:20px;background:rgba(30,30,45,.95);color:#fff;padding:10px 15px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,.2);font-size:14px;z-index:10000;animation:.3s ease-out slideUp,.5s ease-in 2.5s forwards fadeOut;max-width:250px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1)}.notification.error{background:rgba(255,99,71,.8)}@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes fadeOut{to{opacity:0;transform:translateY(20px)}}.smy-notification{position:fixed;bottom:20px;right:20px;padding:12px 24px;border-radius:8px;color:#fff;z-index:10000;animation:.3s smy-fadeIn;max-width:300px;font-family:system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.15)}.smy-notification-success{background:#4caf50}.smy-notification-error{background:#f44336}.smy-notification-info{background:#2196f3;white-space:pre-wrap}@keyframes smy-fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;

    const container = Object.assign(document.createElement('div'), {
        className: 'smy-panel-container',
        innerHTML: `
    <button class="smy-panel-toggle">🌙</button>
    <div class="smy-panel">
      <div class="smy-panel-header">
        <h3>🌙 SMY-Transferer</h3>
        <div class="header-actions">
          <button class="copy-btn" id="headerCopyBtn" disabled>Copy Selected</button>
        </div>
      </div>
      <div class="smy-panel-content" id="smyPanelContent"></div>
    </div>
  `
    });
    document.body.appendChild(container);


    const state = {
        playlists: [],
        selectedPlaylists: [],
        currentTracking: null,
        songObserver: null,
        buttonObserver: null
    };

    const panel = container.querySelector('.smy-panel');
    const toggleBtn = container.querySelector('.smy-panel-toggle');
    const contentDiv = document.getElementById('smyPanelContent');
    const copyBtn = document.getElementById('headerCopyBtn');

    toggleBtn.addEventListener('click', () => panel.classList.toggle('active'));
    copyBtn.addEventListener('click', copySelected);

    const getAncestor = (el, levelsUp) => {
        let current = el;
        while (levelsUp-- && current?.parentElement) current = current.parentElement;
        return current || null;
    };

    const updatePlaylist = (playlistName, newSongs) => {
        let updated = false;
        const existing = state.playlists.find(p => p.playlistName === playlistName);

        if (existing) {
            const combinedSongs = [...existing.songs];
            for (const song of newSongs) {
                if (!combinedSongs.includes(song)) {
                    combinedSongs.push(song);
                    updated = true;
                }
            }
            if (updated) {
                existing.songs = combinedSongs;
                console.log('🔄 Playlist updated:', playlistName);
                updatePlaylistItem(playlistName, combinedSongs.length);
            }
        } else {
            state.playlists.push({ playlistName, songs: newSongs });
            updated = true;
            console.log('🆕 New playlist:', playlistName);
            addPlaylistItem(playlistName, newSongs.length);
        }

        updated && updateUI();
    };


    const observeSongs = (ancestor, playlistName) => {
        const songsContainer = ancestor.querySelector('div:nth-child(2) > div:nth-child(3) > div:nth-child(1) div:nth-child(1) div:nth-child(1) > div[role="presentation"]:nth-child(2)');
        if (!songsContainer) return console.log('⚠️ Songs container not found');

        const processSongs = () => {
            const songs = [...songsContainer.querySelectorAll('div[role="row"] div[role="gridcell"]:nth-child(2)')]
            .map(el => el.innerText.replace(/\n/g, ' ').trim())
            .filter(Boolean);
            songs.length && updatePlaylist(playlistName, songs);
        };

        state.songObserver?.disconnect();
        state.songObserver = new MutationObserver(processSongs);
        state.songObserver.observe(songsContainer, { childList: true, subtree: true });
        processSongs();
    };


    const setupPlaylistTracking = button => {
        const playlistName = button?.innerText?.trim().replace(/\n/g, ' ') || 'Unknown Playlist';
        const ancestor = getAncestor(button, 5);
        if (!ancestor) return;
        contentDiv.querySelector(`[data-playlist="${state.currentTracking}"]`)?.classList.remove('tracking');
        contentDiv.querySelector(`[data-playlist="${playlistName}"]`)?.classList.add('tracking');
        state.currentTracking = playlistName;
        observeSongs(ancestor, playlistName);
    };

    function addPlaylistItem(name,songCount){
        const existing = contentDiv.querySelector(`[data-playlist="${name}"]`);
        if (existing) return;
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.dataset.playlist = name;
        item.innerHTML = `<div class="playlist-name" title="${name}">${name}</div><div class="playlist-count">${songCount} songs</div><button class="delete-btn">✕</button>`;
        contentDiv.appendChild(item);
        item.addEventListener('click',function(e){
            if (!e.target.classList.contains('delete-btn')){
                handleSelection(item,name);
            }
        });
        item.querySelector('.delete-btn').addEventListener('click',(e)=>{
            e.stopPropagation();
            deletePlaylist(name,item);
        });
    }


    const updatePlaylistItem = (name, count) => {
        const el = contentDiv.querySelector(`[data-playlist="${CSS.escape(name)}"] .playlist-count`);
        if (el) el.textContent = `${count} song${count !== 1 ? 's' : ''}`;
    };

    function handleSelection(item,name){
        item.classList.add('click-effect');
        setTimeout(()=>item.classList.remove('click-effect'),300);
        const index = state.selectedPlaylists.indexOf(name);
        ~index?(state.selectedPlaylists.splice(index,1),item.classList.remove('selected')):(state.selectedPlaylists.push(name),item.classList.add('selected'));
        updateCopyButton();
    }

    function deletePlaylist(name,item){
        state.playlists = state.playlists.filter(p=>p.playlistName !== name);
        state.selectedPlaylists = state.selectedPlaylists.filter(p=>p !== name);
        if (state.currentTracking === name) state.currentTracking = null;
        item.remove();
        updateCopyButton();
    }

    function copySelected(){
        if (!state.selectedPlaylists.length) return showNotification('No playlists selected','error');
        const selectedData = state.playlists.filter(({playlistName})=>state.selectedPlaylists.includes(playlistName)).map(({playlistName:name,songs})=>({name,songs:songs.map(s=>typeof s==='string'?s:`${s.name} ${s.artist}`)}));

        const jsCode = `
    /* Spotify to YouTube Music Transfer Data */
window.playlists = ${JSON.stringify(selectedData,null,2)};
/* Secure script loading */
document.head.append(Object.assign(document.createElement('script'),{src:(window.trustedTypes?.createPolicy('yt-import',{createScriptURL:u=>u})?.createScriptURL('https://cdn.jsdelivr.net/gh/Qwyua/SMY-Transferer@2f1451c/src/playlist-transferer.js'))??'https://cdn.jsdelivr.net/gh/Qwyua/SMY-Transfer@2f1451c/src/playlist-transferer.js',crossOrigin:'anonymous'}));
`;

        navigator.clipboard.writeText(jsCode).then(()=>showNotification('Transfer code copied! Paste into YouTube Music console','success')||console.log('Transfer code copied:',jsCode)).catch(err=>showNotification('Copy failed. Please try again.','error')||console.error('Copy failed:',err));

    }

    const showNotification = (message,type='success',duration=3e3)=>{
        document.querySelectorAll('.smy-notification').forEach(element=>element.remove());
        const notification = document.createElement('div');
        notification.className = `smy-notification smy-notification-${type}`;
        notification.textContent = message;
        document.body.append(notification);
        setTimeout(() => {
            notification.style.animation = 'smy-fadeOut .3s';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    };

    const updateCopyButton=()=>{copyBtn.disabled=!state.selectedPlaylists.length}

    const updateUI=()=>{
        contentDiv.innerHTML = '';
        state.playlists.forEach(({playlistName,songs})=>addPlaylistItem(playlistName,songs.length));
    };


    document.querySelector('#main-view div [data-testid="entityTitle"] button')?.let(setupPlaylistTracking);

    const mainObserver = new MutationObserver(mutations=>{
        for (const mutation of mutations){
            for (const node of mutation.addedNodes){
                if (node.nodeType !== 1) continue;
                const found = node.matches?.('#main-view div [data-testid="entityTitle"] button')?node:node.querySelector?.('#main-view div [data-testid="entityTitle"] button');
                if (found){
                    if (state.buttonObserver) state.buttonObserver.disconnect();
                    state.buttonObserver = new MutationObserver(()=>setupPlaylistTracking(found));
                    state.buttonObserver.observe(found,{attributes: true,attributeFilter: ['aria-label'] });
                    setupPlaylistTracking(found);
                }
            }
        }
    });

    mainObserver.observe(document.body,{childList:true,subtree:true});
