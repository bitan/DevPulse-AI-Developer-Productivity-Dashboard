# devpulse-track

`devpulse-track` is a small Node.js CLI that records your development commands and sends them to Firebase Firestore via the REST API.

It auto-detects the type of tool being used (git, docker, npm, python) and prints colorful status output in your terminal.

## Installation

From the project root:

```bash
npm install
npm link
```

This will install dependencies and link the `devpulse-track` binary globally so you can run it from anywhere.

## Usage

```bash
devpulse-track "git status"
devpulse-track "npm run build"
devpulse-track "docker ps"
devpulse-track "python main.py"
```

The CLI takes the entire remainder of the command line as a single command string and:

- **Detects tool type**: `git`, `docker`, `npm`, `python`, or `other`
- **Sends a document** to Firestore with:
  - `command`
  - `toolType`
  - `timestamp`
  - `hostname`
  - `cwd`
- **Prints colorful output** indicating success or failure

## Environment variables

Set these before using the CLI:

- `FIREBASE_PROJECT_ID` **(required)**: your Firebase project ID.
- `FIREBASE_COLLECTION` *(optional)*: Firestore collection name. Default: `devpulse_commands`.
- `FIREBASE_API_KEY` *(optional)*: appended as `?key=...` on the Firestore REST URL.
- `FIREBASE_BEARER_TOKEN` *(optional)*: if set, used as `Authorization: Bearer <token>`.

> Note: Your Firestore security rules must allow the REST write you are making (via API key and/or bearer token). This tool does not manage auth for you; it just sends the request.

## Example

```bash
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_COLLECTION="devpulse_commands"
export FIREBASE_API_KEY="your-firebase-web-api-key"

devpulse-track "git commit -m 'Refactor API client'"
```

You should see a green success message in your terminal, and a new document in the configured Firestore collection.

