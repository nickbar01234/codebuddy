# Code Buddy

_Your daily dose of LeetCode can be tedious, but you don't have to do it alone! Code Buddy allows you to share your experience with friends and strangers_.

Code Buddy is a Google Chrome extension designed to connect up to 4 people working on the same LeetCode problem together.
Using the extension, we hope that you will have fun while doing LeetCode, while also having someone to keep you accountable ;)

We would like to acknowledge `binarysearch.com` (which unfortunately no longer exist) for the inspiration and [LeetRoom](https://leetrooms.com/) for the initial execution.

## Features

- Live streaming code
- Live streaming test cases
- Navigating between problems upon completion
- Support for Google Chrome and Arc browser

## Notes

Code Buddy is still under active development. At the time of writing, you'll have the best experience running the extension with friends on a local network.

## Contributing

### Database Setup

**NOTE**: This step is required for either [Extension](#extension) or [Cloud Functions](#cloud-functions) development.
You will need to setup a Firebase project, following the [public doc](https://firebase.google.com/docs/firestore/quickstart).

### Extension

### [Optional] Install Redux DevTools

1. Go to [Redux DevTools Releases](https://github.com/reduxjs/redux-devtools/tags).
2. Click the latest tag and download `chrome.zip`.
3. Unzip the file, and you will get a folder.
4. Rename the folder to `redux`.
5. Copy and paste the `redux` folder inside `/extension`.
6. So we should have a directory `/extension/redux_devtools`

7. In your Firebase project, navigate to `Project Settings` and click `Add App`.

8. Select Web App and proceed with the instructions. You should see something like the following snippet at the end.

   ```js
   // Import the functions you need from the SDKs you need
   import { initializeApp } from "firebase/app";
   import { getAnalytics } from "firebase/analytics";
   // TODO: Add SDKs for Firebase products that you want to use
   // https://firebase.google.com/docs/web/setup#available-libraries

   // Your web app's Firebase configuration
   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
   const firebaseConfig = {
     apiKey:
     authDomain:
     projectId:
     storageBucket:
     messagingSenderId:
     appId:
     measurementId:
   };

   // Initialize Firebase
   const app = initializeApp(firebaseConfig);
   const analytics = getAnalytics(app);
   ```

9. `cd extension`
10. Make a copy of `.env.tpl` and rename to `.env`. Replace the values with the configurations from above.
11. `pnpm i`
12. `pnpm run dev` will spin up 2 browsers using Puppeteer with the extension loaded. Every time the source code changes, the browser will reload to get the latest changes. Additionally, you can run `dev:1`, `dev:3`, and `dev:4` to load the corresponding number of browsers.

Alternatively, if you prefer to manually unpack and load:

- Open `arc://extensions/` (Arc) or `chrome://extensions/` (Chrome)
- Turn on `Developer mode` to the top right corner
- Press `Load unpacked` and select `extension/dist`
- Navigate to `https://leetcode.com/problems/<problem>`
- Force refresh the page to see the latest change

### Cloud Functions

1. `pnpm install --global firebase-tools`
2. `firebase login` using your credentials from [Database Setup](#database-setup)
3. Run `firebase projects:list` and note down your project ID.
4. Make a copy of `.firebaserc.tpl` and rename to `.firebaserc`. Replace `PROJECT_ID` with your project id.
5. Run `firebase emulators:start` for local development.
