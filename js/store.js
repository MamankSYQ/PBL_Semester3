// Pengganti localStorage untuk data WASHUP. Dimuat sebelum app.js.
// - Baca: dari window.__WASHUP_DATA (dikirim PHP dari database), bukan dari browser.
// - Tulis: setItem() dibandingkan dengan data sebelumnya, selisihnya (tambah/ubah/hapus) dikirim ke api/sync.php.
// app.js tidak perlu diubah untuk membaca/menulis data; kunci lain (mis. preferensi sidebar) tetap di localStorage biasa.
(() => {
  // Fallback base URL: ambil dari lokasi store.js sendiri jika bootstrap PHP gagal.
  const storeScript = document.currentScript;
  let rootFromScript = '';
  try {
    if (storeScript && storeScript.src) {
      rootFromScript = new URL('../', storeScript.src).pathname.replace(/\/+$/, '');
    }
  } catch (e) {
    console.error('[WASHUP] Tidak dapat menentukan base URL dari store.js:', e);
  }
  if (typeof window.WASHUP_ROOT !== 'string' || !window.WASHUP_ROOT) {
    window.WASHUP_ROOT = rootFromScript;
  }

  const LISTS = new Set(["washupUsers", "washupServices", "washupShifts", "washupTransactions", "washupExpenses", "washupPetugasAttendance"]);
  const MAPS = { washupShiftSchedule: "leaf", washupShiftSchedulePublished: "leaf", washupShiftSchedulePublishedAt: "flat" };
  const LOCAL = new Set(["washupDeletedServiceIds", "washupDeletedShiftIds"]);   // penanda client-side, tidak disinkronkan
  const cache = JSON.parse(JSON.stringify(window.__WASHUP_DATA || {}));
  const idMap = new Map();   // id sementara dari browser -> id asli dari database
  const rev = new Map();     // id asli dari database -> id sementara yang masih dipakai halaman (arah baca)
  let chain = Promise.resolve(), pending = 0, failed = false, lastError = null;
  const proto = Storage.prototype, rawGet = proto.getItem, rawSet = proto.setItem, rawRemove = proto.removeItem;
  const managed = (store, key) => store === window.localStorage && (LISTS.has(key) || key in MAPS || LOCAL.has(key));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const csrfToken = () => window.WASHUP_CSRF || document.querySelector('meta[name="csrf-token"]')?.content || "";

  // Data yang dibaca halaman: akun/baris yang baru dibuat tetap memakai id sementara,
  // supaya tombol Edit/Detail yang sudah tergambar masih menemukan barisnya.
  const view = (key) => (LISTS.has(key) && Array.isArray(cache[key]))
    ? cache[key].map((r) => (rev.has(String(r.id)) ? { ...r, id: rev.get(String(r.id)) } : r))
    : cache[key];

  proto.getItem = function (key) {
    return managed(this, key) ? (key in cache ? JSON.stringify(view(key)) : null) : rawGet.call(this, key);
  };
  proto.removeItem = function (key) { if (!managed(this, key)) rawRemove.call(this, key); };   // data server tidak dihapus dari browser
  proto.setItem = function (key, value) {
    if (!managed(this, key)) return rawSet.call(this, key, value);
    let next; try { next = JSON.parse(value); } catch { return; }
    if (LOCAL.has(key)) { cache[key] = next; return; }
    let ops;
    if (LISTS.has(key)) {
      next = (Array.isArray(next) ? next : []).map((r) => (idMap.has(String(r.id)) ? { ...r, id: idMap.get(String(r.id)) } : r));
      ops = diffList(cache[key] || [], next);
    } else ops = diffMap(key, cache[key] || {}, next || {});
    cache[key] = next;
    if (ops.length) enqueue(key, ops);
  };

  function diffList(prev, next) {
    const old = new Map(prev.map((r) => [String(r.id), r])), ids = new Set(), ops = [];
    for (const r of next) {
      const id = String(r.id); ids.add(id);
      const o = old.get(id);
      if (!o) { ops.push({ op: "create", id, record: r }); continue; }
      const changed = [...new Set([...Object.keys(o), ...Object.keys(r)])].filter((f) => !same(o[f], r[f]));
      if (changed.length) ops.push({ op: "update", id, record: r, changed });
    }
    for (const id of old.keys()) if (!ids.has(id)) ops.push({ op: "delete", id });
    return ops;
  }
  function diffMap(key, prev, next) {
    const ops = [];
    if (MAPS[key] === "flat") {
      for (const w of new Set([...Object.keys(prev), ...Object.keys(next)])) if (!same(prev[w], next[w])) ops.push({ week: w, value: next[w] ?? null });
      return ops;
    }
    for (const d of new Set([...Object.keys(prev), ...Object.keys(next)])) {
      const a = prev[d] || {}, b = next[d] || {};
      for (const u of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[u] !== b[u]) ops.push({ date: d, username: u, value: b[u] ?? null });
    }
    return ops;
  }

  function enqueue(key, ops) {
    pending++;
    chain = chain.then(() => send(key, ops)).catch(fail).finally(() => { pending--; });
  }
  async function send(key, ops) {
    if (failed) return;
    const sent = ops.map((o) => (o.op !== "create" && o.id != null && idMap.has(String(o.id)) ? { ...o, id: idMap.get(String(o.id)) } : o));
    const body = JSON.stringify({ key, ops: sent });
    const res = await fetch((window.WASHUP_ROOT || "") + "/api/sync.php", {
      method: "POST", credentials: "same-origin", keepalive: body.length < 60000,
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken() }, body,
    });
    let data = {}; try { data = await res.json(); } catch {}
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan ke server (" + res.status + ").");
    if (!LISTS.has(key)) return;
    const list = cache[key] || (cache[key] = []);
    const put = (rec, oldId) => {
      const i = list.findIndex((r) => String(r.id) === String(oldId ?? rec.id));
      if (i >= 0) list[i] = rec; else list.push(rec);
    };
    for (const r of data.results || []) {
      if (!r.record) continue;
      const op = sent.find((o) => String(o.id) === String(r.id));
      if (op && op.op === "create") {
        idMap.set(String(r.id), String(r.record.id));
        rev.set(String(r.record.id), String(r.id));
      }
      put(r.record, r.id);
      for (const s of r.siblings || []) put(s);   // kendaraan lain di nomor antrean yang sama ikut berubah
    }
  }
  function fail(err) {
    lastError = err instanceof Error ? err : new Error("Gagal menyimpan ke server.");
    if (failed) return;
    failed = true;
    alert((lastError.message || "Gagal menyimpan ke server.") + "\nHalaman akan dimuat ulang dengan data terbaru.");
    location.reload();
  }
  window.addEventListener("beforeunload", (e) => { if (pending > 0) { e.preventDefault(); e.returnValue = ""; } });
  window.WashupStore = {
    flush: async () => {
      await chain;
      if (lastError) {
        const error = lastError;
        lastError = null;
        throw error;
      }
    },
    cache, idMap, rev,
  };
})();