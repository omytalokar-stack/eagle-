# Session Clear Instructions

Agar aapko ObjectId cast error aa raha hai, to yeh karo:

## Browser mein Session Clear karo:

1. **Chrome/Edge:**
   - `F12` press karo (Developer Tools)
   - **Application** tab kholo
   - Left side se **Cookies** → `http://localhost:5000` select karo
   - `connect.sid` cookie ko delete karo
   - Browser refresh karo

2. **Ya Simple:**
   - Browser mein `Ctrl+Shift+Delete` press karo
   - "Cookies and other site data" select karo
   - "Last hour" select karo
   - Clear karo

## Backend Restart:

Backend server ko restart karo:
```powershell
# Stop server (Ctrl+C)
# Then restart:
node server.js
```

## Test:

1. Browser refresh karo (`F5`)
2. Login button pe click karo
3. Google se login karo
4. Webapp pe redirect hoga
5. Logout button dikhega
