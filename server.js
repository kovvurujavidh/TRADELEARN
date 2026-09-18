// TradeLearn Backend REST API & Static Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, all, get, run, isPostgres } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// Helper to safely parse JSON photos
function formatTradeRow(row) {
  if (!row) return null;
  let photos = [];
  try {
    photos = row.photos ? JSON.parse(row.photos) : [];
  } catch (e) {
    photos = [];
  }
  return {
    id: row.id,
    date: row.date,
    bias: row.bias || '',
    liquidity: row.liquidity || '',
    sweep: row.sweep || 'No',
    mss: row.mss || 'No',
    displacement: row.displacement || 'No',
    entry: row.entry || '',
    sl: row.sl || '',
    tp: row.tp || '',
    result: row.result || '',
    description: row.description || '',
    photos: Array.isArray(photos) ? photos : [],
    createdAt: Number(row.created_at) || Date.now()
  };
}

function formatLearnRow(row) {
  if (!row) return null;
  let photos = [];
  try {
    photos = row.photos ? JSON.parse(row.photos) : [];
  } catch (e) {
    photos = [];
  }
  return {
    id: row.id,
    date: row.date,
    category: row.category || 'Note',
    title: row.title || '',
    description: row.description || '',
    rules: row.rules || '',
    photos: Array.isArray(photos) ? photos : [],
    createdAt: Number(row.created_at) || Date.now()
  };
}

function formatStrategyRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    date: row.date || '',
    createdAt: Number(row.created_at) || Date.now()
  };
}

// ------------------- API ROUTES -------------------

// Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isPostgres ? 'postgresql' : 'sqlite',
    timestamp: Date.now()
  });
});

// =================== TRADES API ===================

// GET all trades
app.get('/api/trades', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM trades ORDER BY date DESC, created_at DESC');
    res.json(rows.map(formatTradeRow));
  } catch (err) {
    console.error('Error fetching trades:', err);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// POST new trade
app.post('/api/trades', async (req, res) => {
  try {
    const t = req.body;
    const id = t.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
    const photosJson = JSON.stringify(t.photos || []);
    const createdAt = t.createdAt || Date.now();

    await run(
      `INSERT INTO trades (id, date, bias, liquidity, sweep, mss, displacement, entry, sl, tp, result, description, photos, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        t.date || new Date().toISOString().split('T')[0],
        t.bias || '',
        t.liquidity || '',
        t.sweep || 'No',
        t.mss || 'No',
        t.displacement || 'No',
        t.entry || '',
        t.sl || '',
        t.tp || '',
        t.result || '',
        t.description || '',
        photosJson,
        createdAt
      ]
    );

    const saved = await get('SELECT * FROM trades WHERE id = ?', [id]);
    res.status(201).json(formatTradeRow(saved));
  } catch (err) {
    console.error('Error adding trade:', err);
    res.status(500).json({ error: 'Failed to save trade' });
  }
});

// PUT update trade
app.put('/api/trades/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const t = req.body;
    const photosJson = JSON.stringify(t.photos || []);

    await run(
      `UPDATE trades SET
        date = ?,
        bias = ?,
        liquidity = ?,
        sweep = ?,
        mss = ?,
        displacement = ?,
        entry = ?,
        sl = ?,
        tp = ?,
        result = ?,
        description = ?,
        photos = ?
       WHERE id = ?`,
      [
        t.date,
        t.bias,
        t.liquidity,
        t.sweep,
        t.mss,
        t.displacement,
        t.entry,
        t.sl,
        t.tp,
        t.result,
        t.description,
        photosJson,
        id
      ]
    );

    const updated = await get('SELECT * FROM trades WHERE id = ?', [id]);
    if (!updated) return res.status(404).json({ error: 'Trade not found' });
    res.json(formatTradeRow(updated));
  } catch (err) {
    console.error('Error updating trade:', err);
    res.status(500).json({ error: 'Failed to update trade' });
  }
});

// DELETE single trade
app.delete('/api/trades/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await run('DELETE FROM trades WHERE id = ?', [id]);
    res.json({ success: true, message: 'Trade deleted' });
  } catch (err) {
    console.error('Error deleting trade:', err);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

// DELETE all trades
app.delete('/api/trades', async (req, res) => {
  try {
    await run('DELETE FROM trades');
    res.json({ success: true, message: 'All trades cleared' });
  } catch (err) {
    console.error('Error clearing trades:', err);
    res.status(500).json({ error: 'Failed to clear trades' });
  }
});

// =================== LEARNINGS API ===================

// GET all learnings
app.get('/api/learns', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM learns ORDER BY date DESC, created_at DESC');
    res.json(rows.map(formatLearnRow));
  } catch (err) {
    console.error('Error fetching learnings:', err);
    res.status(500).json({ error: 'Failed to fetch learnings' });
  }
});

// POST new learning
app.post('/api/learns', async (req, res) => {
  try {
    const l = req.body;
    const id = l.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
    const photosJson = JSON.stringify(l.photos || []);
    const createdAt = l.createdAt || Date.now();

    await run(
      `INSERT INTO learns (id, date, category, title, description, rules, photos, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        l.date || new Date().toISOString().split('T')[0],
        l.category || 'Note',
        l.title || '',
        l.description || '',
        l.rules || '',
        photosJson,
        createdAt
      ]
    );

    const saved = await get('SELECT * FROM learns WHERE id = ?', [id]);
    res.status(201).json(formatLearnRow(saved));
  } catch (err) {
    console.error('Error adding learning:', err);
    res.status(500).json({ error: 'Failed to save learning' });
  }
});

// PUT update learning
app.put('/api/learns/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const l = req.body;
    const photosJson = JSON.stringify(l.photos || []);

    await run(
      `UPDATE learns SET
        date = ?,
        category = ?,
        title = ?,
        description = ?,
        rules = ?,
        photos = ?
       WHERE id = ?`,
      [
        l.date,
        l.category,
        l.title,
        l.description,
        l.rules,
        photosJson,
        id
      ]
    );

    const updated = await get('SELECT * FROM learns WHERE id = ?', [id]);
    if (!updated) return res.status(404).json({ error: 'Learning not found' });
    res.json(formatLearnRow(updated));
  } catch (err) {
    console.error('Error updating learning:', err);
    res.status(500).json({ error: 'Failed to update learning' });
  }
});

// DELETE single learning
app.delete('/api/learns/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await run('DELETE FROM learns WHERE id = ?', [id]);
    res.json({ success: true, message: 'Learning deleted' });
  } catch (err) {
    console.error('Error deleting learning:', err);
    res.status(500).json({ error: 'Failed to delete learning' });
  }
});

// DELETE all learnings
app.delete('/api/learns', async (req, res) => {
  try {
    await run('DELETE FROM learns');
    res.json({ success: true, message: 'All learnings cleared' });
  } catch (err) {
    console.error('Error clearing learnings:', err);
    res.status(500).json({ error: 'Failed to clear learnings' });
  }
});

// =================== STRATEGIES API ===================

// GET all strategies
app.get('/api/strategies', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM strategies ORDER BY created_at DESC');
    res.json(rows.map(formatStrategyRow));
  } catch (err) {
    console.error('Error fetching strategies:', err);
    res.status(500).json({ error: 'Failed to fetch strategies' });
  }
});

// POST new strategy
app.post('/api/strategies', async (req, res) => {
  try {
    const s = req.body;
    const id = s.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
    const createdAt = s.createdAt || Date.now();

    await run(
      `INSERT INTO strategies (id, title, content, date, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        s.title || 'Untitled Strategy',
        s.content || '',
        s.date || new Date().toISOString().split('T')[0],
        createdAt
      ]
    );

    const saved = await get('SELECT * FROM strategies WHERE id = ?', [id]);
    res.status(201).json(formatStrategyRow(saved));
  } catch (err) {
    console.error('Error adding strategy:', err);
    res.status(500).json({ error: 'Failed to save strategy' });
  }
});

// PUT update strategy
app.put('/api/strategies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const s = req.body;

    await run(
      `UPDATE strategies SET title = ?, content = ? WHERE id = ?`,
      [s.title, s.content, id]
    );

    const updated = await get('SELECT * FROM strategies WHERE id = ?', [id]);
    if (!updated) return res.status(404).json({ error: 'Strategy not found' });
    res.json(formatStrategyRow(updated));
  } catch (err) {
    console.error('Error updating strategy:', err);
    res.status(500).json({ error: 'Failed to update strategy' });
  }
});

// DELETE strategy
app.delete('/api/strategies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await run('DELETE FROM strategies WHERE id = ?', [id]);
    res.json({ success: true, message: 'Strategy deleted' });
  } catch (err) {
    console.error('Error deleting strategy:', err);
    res.status(500).json({ error: 'Failed to delete strategy' });
  }
});

// =================== FULL BACKUP & RESTORE API ===================

// GET full backup
app.get('/api/backup', async (req, res) => {
  try {
    const tradeRows = await all('SELECT * FROM trades ORDER BY date DESC');
    const learnRows = await all('SELECT * FROM learns ORDER BY date DESC');
    const strategyRows = await all('SELECT * FROM strategies ORDER BY created_at DESC');

    res.json({
      appName: 'TradeLearn',
      version: 2,
      exportDate: new Date().toISOString(),
      trades: tradeRows.map(formatTradeRow),
      learns: learnRows.map(formatLearnRow),
      strategies: strategyRows.map(formatStrategyRow)
    });
  } catch (err) {
    console.error('Error exporting backup:', err);
    res.status(500).json({ error: 'Failed to export backup' });
  }
});

// POST restore backup
app.post('/api/backup', async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid backup format' });
    }

    const importedTrades = Array.isArray(data.trades) ? data.trades : [];
    const importedLearns = Array.isArray(data.learns) ? data.learns : [];
    const importedStrategies = Array.isArray(data.strategies) ? data.strategies : [];

    // Clear existing tables
    await run('DELETE FROM trades');
    await run('DELETE FROM learns');
    await run('DELETE FROM strategies');

    // Insert trades
    for (const t of importedTrades) {
      const id = t.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
      await run(
        `INSERT INTO trades (id, date, bias, liquidity, sweep, mss, displacement, entry, sl, tp, result, description, photos, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          t.date || new Date().toISOString().split('T')[0],
          t.bias || '',
          t.liquidity || '',
          t.sweep || 'No',
          t.mss || 'No',
          t.displacement || 'No',
          t.entry || '',
          t.sl || '',
          t.tp || '',
          t.result || '',
          t.description || '',
          JSON.stringify(t.photos || []),
          t.createdAt || Date.now()
        ]
      );
    }

    // Insert learns
    for (const l of importedLearns) {
      const id = l.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
      await run(
        `INSERT INTO learns (id, date, category, title, description, rules, photos, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          l.date || new Date().toISOString().split('T')[0],
          l.category || 'Note',
          l.title || '',
          l.description || '',
          l.rules || '',
          JSON.stringify(l.photos || []),
          l.createdAt || Date.now()
        ]
      );
    }

    // Insert strategies
    for (const s of importedStrategies) {
      const id = s.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
      await run(
        `INSERT INTO strategies (id, title, content, date, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          s.title || 'Untitled Strategy',
          s.content || '',
          s.date || new Date().toISOString().split('T')[0],
          s.createdAt || Date.now()
        ]
      );
    }

    res.json({
      success: true,
      restored: {
        trades: importedTrades.length,
        learns: importedLearns.length,
        strategies: importedStrategies.length
      }
    });
  } catch (err) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Fallback to index.html for root or SPA paths
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TradeLearn Server is running on http://localhost:${PORT}`);
    console.log(`📱 Access on your local network (mobile/laptop) via: http://<your-local-ip>:${PORT}`);
  });
}).catch(err => {
  console.error('Fatal initialization error:', err);
});
