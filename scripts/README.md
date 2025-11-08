# Scripts

## fetch-transactions.js

This script fetches all transactions from Firebase Firestore and saves them to `src/api/transactions-database-dump.json`. This file is used for auto-categorization of transactions.

### Prerequisites

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Get Firebase Service Account Key**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the gear icon ⚙️ (Project Settings)
   - Go to "Service Accounts" tab
   - Click "Generate new private key"
   - Save the JSON file somewhere secure (e.g., `~/Downloads/serviceAccountKey.json`)
   - **IMPORTANT**: Never commit this file to git!

### Usage

Run the script with the service account credentials:

```bash
# Set the environment variable and run
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
pnpm fetch-transactions
```

Or in one line:

```bash
GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json" pnpm fetch-transactions
```

### What it does

1. Connects to Firebase using the service account credentials
2. Fetches all documents from the `transactions` collection
3. Converts Firestore Timestamps to the correct format
4. Sorts transactions by date (newest first)
5. Saves to `src/api/transactions-database-dump.json`

### Example Output

```
🔥 Initializing Firebase Admin...
📊 Fetching all transactions from Firestore...
✅ Found 1234 transactions
💾 Writing to file...
✅ Successfully saved 1234 transactions to /path/to/src/api/transactions-database-dump.json
🎉 Done!
```

### Troubleshooting

**Error: GOOGLE_APPLICATION_CREDENTIALS not set**
- Make sure you've set the environment variable correctly
- Check that the path to your service account key file is correct

**Error: Permission denied**
- Make sure your service account has read permissions for Firestore
- Check that you're using the correct Firebase project

**Error: Module not found**
- Run `pnpm install` to install all dependencies including `firebase-admin`
