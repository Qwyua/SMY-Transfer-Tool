<div><h1 id="smy" align="center">🌙 SMY — Transfer Tool</h1></div>
<p id="smy" align="center"><img src="https://cdn.jsdelivr.net/gh/Qwyua/SMY-Transfer-Tool@main/assets/smybanner.png" alt="SMY Banner" style="width:100%"></p>

---
<br>

> **✨ No extensions!** **🚀 Console magic!** **⏳ Saves hours!**

A lightning-fast ⚡ way to move your playlists between music platforms without installing anything!

---
## 🛡️ Why Choose SMY?

**Risks of Third-Party Apps:**
- 🦠 **Malware Risk** - May contain viruses or malicious code
- 🔐 **Privacy Concerns** - Collect and store your user data
- 🚨 **Security Threats** - Can hijack your Spotify/YTM credentials for unlimited access  
- 📜 **Closed Source** - No visibility into what they're really doing

**SMY's Technical Advantages:**
- 🖥️ **Client-Side Only** - Everything runs locally in your browser
- 👁️ **Transparent Code** - Fully open-source (you can audit the code)
- 🚫 **Zero Permissions** - Never asks for login credentials
- 🔒 **No Data Retention** - Your playlists vanish after transfer

---

## 🚀 How to Use
### 1. Open Spotify Web
Go to [https://open.spotify.com](https://open.spotify.com) and log in to your account.

![Spotify Web](assets/spotify-preview.png)


### 2. Open DevTools
- Press `F12` or `Ctrl+Shift+J` (Windows/Linux), or `Cmd+Option+I` (Mac) to open **Developer Tools**.
- Navigate to the **Console** tab.

### 3. Allow Pasting (Optional Step)
Sometimes browsers block paste actions. To enable pasting, type and press Enter:

```js
allow pasting
```

```js
fetch('https://cdn.jsdelivr.net/gh/Qwyua/SMY-Transfer-Tool@7446078/src/smy-panel.js').then(r=>r.text()).then(eval)
```
<!--document.head.append(Object.assign(document.createElement('script'),{type:'module',src:URL.createObjectURL(new Blob([await(await fetch('https://cdn.jsdelivr.net/gh/Qwyua/SMY-Transfer-Tool@7446078/src/smy-panel.js')).text()],{type:'text/javascript'}))})))-->

![Open DevTools Step 1](assets/step1-opendevtools.gif)


