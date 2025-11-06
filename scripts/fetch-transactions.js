#!/usr/bin/env node

/**
 * Script to fetch all transactions from Firebase and save to transactions-database-dump.json
 *
 * Usage:
 *   node scripts/fetch-transactions.js
 *
 * Prerequisites:
 *   1. Install firebase-admin: pnpm add -D firebase-admin
 *   2. Download service account key from Firebase Console
 *   3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { writeFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DUMP_FILE_PATH = resolve(
  __dirname,
  "../src/api/transactions-database-dump.json",
);

async function fetchTransactions() {
  console.log("🔥 Initializing Firebase Admin...");

  // Check for service account credentials
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      "❌ Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set",
    );
    console.log("\nPlease set it to your service account key file path:");
    console.log(
      '  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"',
    );
    console.log("\nOr run with:");
    console.log(
      '  GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json" node scripts/fetch-transactions.js',
    );
    process.exit(1);
  }

  try {
    // Initialize Firebase Admin
    initializeApp({
      credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    });

    const db = getFirestore();

    console.log("📊 Fetching all transactions from Firestore...");

    // Fetch all transactions
    const transactionsSnapshot = await db.collection("transactions").get();

    console.log(`✅ Found ${transactionsSnapshot.size} transactions`);

    // Convert to array with proper formatting
    const transactions = transactionsSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        periodId: data.periodId,
        amount: data.amount,
        date: data.date?.toDate?.()?.toISOString?.() || data.date,
        category: data.category,
        label: data.label,
        lastUpdated: data.lastUpdated
          ? {
              seconds:
                data.lastUpdated.seconds ||
                Math.floor(data.lastUpdated.toDate().getTime() / 1000),
              nanoseconds: data.lastUpdated.nanoseconds || 0,
            }
          : undefined,
        shared: data.shared,
        createdAt: data.createdAt
          ? {
              seconds:
                data.createdAt.seconds ||
                Math.floor(data.createdAt.toDate().getTime() / 1000),
              nanoseconds: data.createdAt.nanoseconds || 0,
            }
          : undefined,
        author: data.author,
        optional: data.optional,
      };
    });

    // Sort by date (newest first)
    transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Keep only unique transactions by label (name)
    const uniqueTransactions = [];
    const seenLabels = new Set();
    
    for (const transaction of transactions) {
      if (!seenLabels.has(transaction.label)) {
        seenLabels.add(transaction.label);
        uniqueTransactions.push(transaction);
      }
    }
    
    console.log(`🔍 Filtered to ${uniqueTransactions.length} unique transaction labels (removed ${transactions.length - uniqueTransactions.length} duplicates)`);
    console.log("💾 Writing to file...");

    // Write to file with pretty formatting
    await writeFile(DUMP_FILE_PATH, JSON.stringify(uniqueTransactions, null, 2));

    console.log(
      `✅ Successfully saved ${uniqueTransactions.length} unique transactions to ${DUMP_FILE_PATH}`,
    );
    console.log("🎉 Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === "ENOENT") {
      console.log("\nMake sure the service account key file exists at:");
      console.log(`  ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
    }
    process.exit(1);
  }
}

fetchTransactions();
