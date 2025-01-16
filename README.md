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

1. To begin, you will need [pnpm](https://pnpm.io/) and either Google Chrome or Arc browser.
2. `cd extension/`
3. `pnpm i`
4. `pnpm run dev` - Every time you make a change, the code will be compiled to `extension/dist`.
5. Unloading the extension on browser:
   - Open `arc://extensions/` (Arc) or `chrome://extensions/` (Chrome)
   - Turn on `Developer mode` to the top right corner
   - Press `Load unpacked` and select `extension/dist`
   - Navigate to `https://leetcode.com/problems/<problem>`
   - Force refresh the page to see the latest change
