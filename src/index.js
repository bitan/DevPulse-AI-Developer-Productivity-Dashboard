const chalk = require('chalk');
const axios = require('axios');

/**
 * Detect the primary tool type based on the command string.
 * Supported types: git, docker, npm, python, other.
 */
function detectToolType(command) {
  if (!command || typeof command !== 'string') {
    return 'other';
  }

  const trimmed = command.trim();
  if (!trimmed) return 'other';

  const [first] = trimmed.split(/\s+/);
  const base = (first || '').toLowerCase();

  if (base === 'git') return 'git';
  if (base === 'docker' || base === 'docker-compose') return 'docker';
  if (['npm', 'yarn', 'pnpm', 'bun'].includes(base)) return 'npm';
  if (['python', 'python3', 'pip', 'pip3', 'poetry', 'pipenv'].includes(base)) return 'python';

  return 'other';
}

/**
 * Build the Firestore REST endpoint URL.
 * Uses environment variables:
 *   FIREBASE_PROJECT_ID  (optional, defaults to "devpulse-85117")
 *   FIREBASE_COLLECTION  (optional, defaults to "devpulse_commands")
 *   FIREBASE_API_KEY     (optional, appended as ?key=...)
 */
function buildFirestoreUrl() {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'devpulse-85117';
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not set.');
  }

  const collection = process.env.FIREBASE_COLLECTION || 'devpulse_commands';

  let url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents/${encodeURIComponent(collection)}`;

  const apiKey = process.env.FIREBASE_API_KEY;
  if (apiKey) {
    url += `?key=${encodeURIComponent(apiKey)}`;
  }

  return url;
}

/**
 * Convert a plain JS object into Firestore "fields" format.
 */
function toFirestoreFields(payload) {
  const fields = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;

    switch (typeof value) {
      case 'string':
        fields[key] = { stringValue: value };
        break;
      case 'number':
        fields[key] = { doubleValue: value };
        break;
      case 'boolean':
        fields[key] = { booleanValue: value };
        break;
      default:
        try {
          fields[key] = { stringValue: JSON.stringify(value) };
        } catch {
          fields[key] = { stringValue: String(value) };
        }
    }
  }

  return { fields };
}

async function sendToFirestore(command, toolType) {
  const url = buildFirestoreUrl();

  const payload = {
    command,
    toolType,
    timestamp: new Date().toISOString(),
    hostname: require('os').hostname(),
    cwd: process.cwd()
  };

  const body = toFirestoreFields(payload);

  const headers = {
    'Content-Type': 'application/json'
  };

  const bearer = process.env.FIREBASE_BEARER_TOKEN;
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  return axios.post(url, body, { headers });
}

function printHelp() {
  console.log(
    chalk.bold.cyan('devpulse-track') +
      ' - ' +
      chalk.white('track dev commands to Firebase Firestore')
  );
  console.log('');
  console.log(chalk.bold('Usage:'));
  console.log(`  ${chalk.green('devpulse-track')} "${chalk.yellow('your command here')}"`);
  console.log('');
  console.log(chalk.bold('Examples:'));
  console.log(`  ${chalk.green('devpulse-track')} "git status"`);
  console.log(`  ${chalk.green('devpulse-track')} "npm run build"`);
  console.log('');
  console.log(chalk.bold('Environment variables:'));
  console.log(`  ${chalk.magenta('FIREBASE_PROJECT_ID')}  ${chalk.gray('- required')}`);
  console.log(`  ${chalk.magenta('FIREBASE_COLLECTION')}  ${chalk.gray('- optional, default: devpulse_commands')}`);
  console.log(`  ${chalk.magenta('FIREBASE_API_KEY')}      ${chalk.gray('- optional, appended as ?key=...')}`);
  console.log(
    `  ${chalk.magenta('FIREBASE_BEARER_TOKEN')} ${chalk.gray(
      '- optional, used as Authorization: Bearer <token>'
    )}`
  );
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || ['-h', '--help'].includes(args[0])) {
    printHelp();
    process.exit(0);
  }

  const command = args.join(' ');
  const toolType = detectToolType(command);

  console.log(chalk.bold.blue('▶ Tracking command: ') + chalk.yellow(command));
  console.log(chalk.bold.blue('▶ Detected tool: ') + chalk.green(toolType));

  try {
    await sendToFirestore(command, toolType);
    console.log(chalk.bold.green('✔ Successfully sent to Firestore.'));
  } catch (error) {
    console.error(chalk.bold.red('✖ Failed to send to Firestore.'));
    if (error.response) {
      console.error(
        chalk.red(
          `HTTP ${error.response.status}: ${JSON.stringify(error.response.data, null, 2)}`
        )
      );
    } else {
      console.error(chalk.red(error.message));
    }
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  detectToolType,
  sendToFirestore
};

