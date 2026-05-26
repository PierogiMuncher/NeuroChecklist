# Neuro Physical Exam

Mobile-first offline PWA for a stepwise neurologic physical exam and copy-ready paragraph summary.

## iPhone Offline Install

The iPhone cannot install this as a durable offline app from your Mac's local `http://192.168...` address. That address only exists while the Mac is nearby, awake, and running the local server.

To make it independent of the computer:

1. Host this folder over HTTPS.
2. Open the HTTPS URL in Safari on the iPhone.
3. Wait until the top chip says `Saved`.
4. Tap Share.
5. Tap Add to Home Screen.
6. Open the home-screen app once while online.
7. Turn on Airplane Mode and reopen it to confirm it works offline.

Safari on iOS requires HTTPS for service workers. A local network URL like `http://192.168...` is useful for testing on the phone, but it will not become a durable offline app until served over HTTPS.

## Fast Hosting Options

### Netlify Drop

1. Go to Netlify Drop.
2. Drag this whole `NeuroChecklist` folder into the browser.
3. Open the generated `https://...netlify.app` URL in iPhone Safari.
4. Add it to the Home Screen.

### GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the repository root.
3. In repository settings, enable GitHub Pages from the main branch root.
4. Open the generated `https://username.github.io/repo-name/` URL in iPhone Safari.
5. Add it to the Home Screen.

The app stores exam progress in the phone browser's local storage. Avoid entering patient identifiers in free-text fields unless you have handled device/security policy for that use.

## Local Test

```sh
python3 -m http.server 5174 --bind 0.0.0.0
```

Open `http://127.0.0.1:5174/` on the Mac, or the Mac's local IP address from the iPhone while both devices are on the same Wi-Fi.
