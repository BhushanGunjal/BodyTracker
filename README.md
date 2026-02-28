# Parkinson Tracker (BodyTracker)

A Progressive Web App (PWA) for tracking Parkinson's disease symptoms and medication timing. Built with vanilla JavaScript, Firebase, and Chart.js.

## Features

- 🔐 **User Authentication** - Secure email/password authentication via Firebase Auth
- 💊 **Medication Logging** - Track medication times with one click
- 📊 **Hourly Symptom Tracking** - Log tremor, stiffness, and movement levels (0-3 scale)
- 📈 **Real-time Dashboard** - Interactive line charts with medication reference lines
- 👤 **User-specific Data** - Each user sees only their own symptom and medication logs
- 📱 **Progressive Web App** - Installable on mobile/desktop, works offline
- 🎨 **Responsive Design** - Bootstrap 5 UI adapts to all screen sizes

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **UI Framework**: Bootstrap 5.3
- **Charts**: Chart.js 4.4
- **Backend**: Firebase (Authentication + Firestore)
- **Architecture**: Modular component-based structure

## Project Structure

```
BodyTracker/
├── index.html              # Main HTML entry point
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── assets/
│   └── icons/              # PWA icons
├── css/
│   └── main.css            # Custom styles
└── js/
    ├── core/
    │   ├── app.js          # Main initialization (12 lines)
    │   └── chart.js        # Chart rendering with race condition prevention
    ├── services/
    │   ├── auth.js         # Firebase authentication
    │   ├── firebase-init.js # Firebase configuration
    │   └── logs.js         # Firestore CRUD operations
    ├── ui/
    │   ├── auth-form.js    # Login/register UI handlers
    │   ├── hourly-form.js  # Symptom log modal & form
    │   └── medication.js   # Medication button handler
    └── utils/
        └── error-mapper.js # User-friendly error messages
```

## Setup Instructions

### Prerequisites

- Node.js (for serving locally via `http-server` or Python's `http.server`)
- Firebase account with a project created
- Modern web browser (Chrome, Firefox, Edge, Safari)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BodyTracker
```

### 2. Firebase Configuration

#### Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider

#### Configure Authorized Domains

1. In **Authentication** → **Settings** → **Authorized domains**
2. Add `localhost` and `127.0.0.1`

#### Set Up Firestore

1. Navigate to **Firestore Database** → **Create database**
2. Start in **Production mode**
3. Go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/symptomLogs/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/medicationLogs/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /symptomLogs/{logId} {
      allow read, write: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    match /medicationLogs/{logId} {
      allow read, write: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click **Publish**

#### Update Firebase Config

1. In Firebase Console → **Project Settings** → **General**
2. Scroll to **Your apps** → Select your web app (or create one)
3. Copy the Firebase configuration object
4. Update `js/services/firebase-init.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Run Locally

**Option 1: Python HTTP Server**
```bash
python -m http.server 5500 --bind 127.0.0.1
```

**Option 2: Node.js HTTP Server**
```bash
npx http-server -p 5500 -a 127.0.0.1
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### 4. Access the App

Open your browser and navigate to:
```
http://127.0.0.1:5500
```

## Usage

### Register & Login

1. Enter email and password
2. Click **Register** to create account
3. Click **Login** to sign in

### Log Medication

1. Click **Medication Log** button
2. Medication time is saved automatically
3. Red dashed lines appear on charts at medication times

### Log Hourly Symptoms

1. Click **Hourly Log** button
2. Select values for:
   - **Tremor** (0-3)
   - **Stiffness** (0-3)
   - **Movement** (Slow/Normal/Fast)
3. Click **Log** to save

### View Dashboard

- Charts update automatically after each log entry
- Three separate charts for tremor, stiffness, and movement
- Red dashed "Med" lines show medication times
- X-axis shows timestamps, Y-axis shows severity levels

### Logout

Click **Logout** button in the top-right corner

## PWA Features

### Installation

- **Desktop**: Click install icon in address bar (Chrome/Edge)
- **Android**: "Add to Home Screen" prompt appears automatically
- **iOS**: Share button → "Add to Home Screen"

### Offline Support

- App caches files on first visit
- Works offline after initial load (Firebase requires internet)
- Automatic cache updates when app version changes

## Development

### Adding New Features

1. **UI Components**: Add to `js/ui/`
2. **Services**: Add to `js/services/`
3. **Utilities**: Add to `js/utils/`
4. **Initialize**: Import and call in `js/core/app.js`

### Code Style

- ES6 modules with explicit imports/exports
- Async/await for asynchronous operations
- Null-safe checks (`?.` operator)
- Guard clauses for early returns
- Single Responsibility Principle

### Key Implementation Details

**Race Condition Prevention**
- `renderDashboard()` uses a lock (`isRendering`) to prevent overlapping renders
- Ensures data consistency when clicking buttons quickly after login

**Error Handling**
- Centralized error mapping in `js/utils/error-mapper.js`
- User-friendly Firebase error messages
- Fallback collection support for legacy data

## Firestore Data Structure

```
users/{userId}/
  ├── symptomLogs/{logId}
  │   ├── uid: string
  │   ├── tremor: number (0-3)
  │   ├── stiffness: number (0-3)
  │   ├── movement: number (-1, 0, 1)
  │   └── timestamp: timestamp
  │
  └── medicationLogs/{logId}
      ├── uid: string
      └── timestamp: timestamp
```

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Internet Explorer (not supported)

## Troubleshooting

### Charts Not Rendering

**Issue**: Charts don't appear after medication log  
**Solution**: Ensure at least one symptom log exists, or wait for race condition fix to complete

### Permission Denied Errors

**Issue**: "Missing or insufficient permissions"  
**Solution**: Check Firestore Rules are properly configured (see Setup section)

### Service Worker Not Registering

**Issue**: PWA features not working  
**Solution**: Must serve via HTTP/HTTPS (not `file://` protocol)

### Auth Configuration Not Found

**Issue**: "auth/configuration-not-found"  
**Solution**: 
1. Verify Firebase config in `firebase-init.js`
2. Enable Email/Password in Firebase Console
3. Add domain to Authorized Domains list

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For questions or feedback, please open an issue in the repository.

---

**Built with ❤️ for Parkinson's disease symptom tracking**
