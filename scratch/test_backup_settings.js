import { onRequestGet, onRequestPost } from '../payslip-ui/functions/api/settings/backup.js';
import assert from 'assert';

console.log("Starting test for settings/backup...");

// Simple mock SQLite D1 Database interface
class MockD1Database {
  constructor() {
    this.rows = [];
  }

  prepare(sql) {
    const db = this;
    return {
      bind(...args) {
        return {
          async run() {
            if (sql.includes("INSERT INTO backup_settings")) {
              db.rows.push({
                id: 1,
                backup_email: args[0],
                frequency: args[1],
                is_enabled: args[2],
                last_backup_at: null
              });
            } else if (sql.includes("UPDATE backup_settings")) {
              const row = db.rows.find(r => r.id === 1);
              if (row) {
                row.backup_email = args[0];
                row.frequency = args[1];
                row.is_enabled = args[2];
              }
            }
            return { success: true };
          }
        };
      },

      async all() {
        if (sql.includes("SELECT * FROM backup_settings")) {
          return { results: db.rows };
        }
        return { results: [] };
      },

      async first() {
        if (sql.includes("SELECT id FROM backup_settings")) {
          const row = db.rows.find(r => r.id === 1);
          return row ? { id: row.id } : null;
        }
        return null;
      }
    };
  }
}

async function runTests() {
  const db = new MockD1Database();

  // Test Case 1: Initial load when database has NO backup_settings row
  const getContext1 = {
    request: {
      headers: {
        get: (name) => name === 'X-User-Email' ? 'admin@example.com' : null
      }
    },
    env: { ksom_payslip_db: db }
  };

  const getRes1 = await onRequestGet(getContext1);
  const getJson1 = await getRes1.json();
  console.log("Get response (empty DB):", getJson1);
  // Should default email to user logged in, is_enabled to undefined/null (not present)
  assert.strictEqual(getJson1.backup_email, 'admin@example.com');
  assert.strictEqual(getJson1.is_enabled, undefined);

  // Test Case 2: Save settings when database has NO backup_settings row (should perform INSERT)
  const postContext1 = {
    request: {
      json: async () => ({
        backup_email: 'backup@example.com',
        frequency: 'daily',
        is_enabled: 1
      })
    },
    env: { ksom_payslip_db: db }
  };

  const postRes1 = await onRequestPost(postContext1);
  const postJson1 = await postRes1.json();
  console.log("Post response (INSERT):", postJson1);
  assert.strictEqual(postJson1.success, true);
  assert.strictEqual(db.rows.length, 1);
  assert.strictEqual(db.rows[0].backup_email, 'backup@example.com');
  assert.strictEqual(db.rows[0].frequency, 'daily');
  assert.strictEqual(db.rows[0].is_enabled, 1);

  // Test Case 3: Load settings after they have been saved
  const getContext2 = {
    request: {
      headers: {
        get: (name) => name === 'X-User-Email' ? 'admin@example.com' : null
      }
    },
    env: { ksom_payslip_db: db }
  };

  const getRes2 = await onRequestGet(getContext2);
  const getJson2 = await getRes2.json();
  console.log("Get response (after INSERT):", getJson2);
  assert.strictEqual(getJson2.backup_email, 'backup@example.com');
  assert.strictEqual(getJson2.frequency, 'daily');
  assert.strictEqual(getJson2.is_enabled, 1);

  // Test Case 4: Save settings again (should perform UPDATE)
  const postContext2 = {
    request: {
      json: async () => ({
        backup_email: 'new_backup@example.com',
        frequency: 'monthly',
        is_enabled: 0
      })
    },
    env: { ksom_payslip_db: db }
  };

  const postRes2 = await onRequestPost(postContext2);
  const postJson2 = await postRes2.json();
  console.log("Post response (UPDATE):", postJson2);
  assert.strictEqual(postJson2.success, true);
  assert.strictEqual(db.rows.length, 1); // Row count should still be 1
  assert.strictEqual(db.rows[0].backup_email, 'new_backup@example.com');
  assert.strictEqual(db.rows[0].frequency, 'monthly');
  assert.strictEqual(db.rows[0].is_enabled, 0);

  console.log("All tests passed successfully!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
