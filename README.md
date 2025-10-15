# Code Buddy

_Your daily dose of LeetCode can be tedious, but you don't have to do it alone! Code Buddy allows you to share your experience with friends and strangers_.

Code Buddy is a Google Chrome extension designed to connect up to 4 people working on the same LeetCode problem together.
Using the extension, we hope that you will have fun while doing LeetCode, while also having someone to keep you accountable 💪.

We would like to acknowledge `binarysearch.com` (which unfortunately no longer exist) for the inspiration and [LeetRoom](https://leetrooms.com/) for the initial execution.

## Features

- Live streaming code and test cases
- Integration with Leetcode problems

## Notes

Code Buddy is still under active development. If your live stream get stuck, try refreshing your browser.

## Contributing

### Requirements

- Docker to run Firebase locally
- [pnpm](https://pnpm.io/)

### Setup

1. `docker compose up -d`
2. `cd extension`
3. `pnpm i`
4. `pnpm run dev:[nth]` to spin up the nth browser
