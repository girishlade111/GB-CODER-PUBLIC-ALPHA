import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import 'fake-indexeddb/auto';
import git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';

const fs = new FS('real-remote-read-test-fs', { wipe: true });
const dir = '/octocat-hello-world';

test('GB Coder Phase 4.2 — Real GitHub Remote Read-Only & Object Verification', async (t) => {
  let rateLimitRemaining = 60;
  let isRateLimited = false;

  await t.test('STAGE B01 — Live GitHub API connection and rate limit check', async () => {
    try {
      const res = await fetch('https://api.github.com/rate_limit', {
        headers: { 'User-Agent': 'GBCoder-Verification-Agent' },
      });
      if (res.status === 200) {
        const body = await res.json();
        rateLimitRemaining = body.resources?.core?.remaining ?? 60;
        console.log(`[REAL_GITHUB_READ_ONLY] Rate limit remaining: ${rateLimitRemaining}`);
        if (rateLimitRemaining < 5) {
          isRateLimited = true;
          console.warn('[REAL_GITHUB_READ_ONLY] Rate limit low, skipping remaining live calls');
        }
      }
    } catch (err) {
      console.warn(`[REAL_GITHUB_READ_ONLY] Network warning: ${err.message}`);
    }
  });

  if (isRateLimited) {
    console.warn('[REAL_GITHUB_READ_ONLY] Skipping live API tests due to rate limit');
    return;
  }

  let repoMeta = null;
  let masterRef = null;
  let liveCommit = null;
  let liveTree = null;
  let liveBlob = null;

  await t.test('STAGE B02 — Live fetch octocat/Hello-World metadata and master ref', async () => {
    const repoRes = await fetch('https://api.github.com/repos/octocat/Hello-World', {
      headers: { 'User-Agent': 'GBCoder-Verification-Agent' },
    });
    assert.equal(repoRes.status, 200, 'Expected HTTP 200 for public repo metadata');
    repoMeta = await repoRes.json();
    assert.equal(repoMeta.full_name, 'octocat/Hello-World');
    assert.equal(repoMeta.default_branch, 'master');

    const refRes = await fetch('https://api.github.com/repos/octocat/Hello-World/git/ref/heads/master', {
      headers: { 'User-Agent': 'GBCoder-Verification-Agent' },
    });
    assert.equal(refRes.status, 200, 'Expected HTTP 200 for master ref');
    masterRef = await refRes.json();
    assert.equal(masterRef.object?.sha, '7fd1a60b01f91b314f59955a4e4d4e80d8edf11d');
  });

  await t.test('STAGE B03 — Live fetch commit object and verify tree SHA pointer', async () => {
    const commitRes = await fetch(masterRef.object.url, {
      headers: { 'User-Agent': 'GBCoder-Verification-Agent' },
    });
    assert.equal(commitRes.status, 200, 'Expected HTTP 200 for commit object');
    liveCommit = await commitRes.json();
    assert.equal(liveCommit.sha, '7fd1a60b01f91b314f59955a4e4d4e80d8edf11d');
    assert.equal(liveCommit.tree?.sha, 'b4eecafa9be2f2006ce1b709d6857b07069b4608');
  });

  await t.test('STAGE B04 — Live fetch tree object and verify blob entry pointer', async () => {
    const treeRes = await fetch(`${liveCommit.tree.url}?recursive=1`, {
      headers: { 'User-Agent': 'GBCoder-Verification-Agent' },
    });
    assert.equal(treeRes.status, 200, 'Expected HTTP 200 for tree object');
    liveTree = await treeRes.json();
    assert.equal(liveTree.sha, 'b4eecafa9be2f2006ce1b709d6857b07069b4608');
    const readmeEntry = liveTree.tree.find((e) => e.path === 'README');
    assert.ok(readmeEntry, 'Expected README entry in tree');
    assert.equal(readmeEntry.sha, '980a0d5f19a64b4b30a87d4206aade58726b60e3');
    assert.equal(readmeEntry.type, 'blob');
  });

  await t.test('STAGE B05 — Live fetch blob object and verify exact Git SHA-1 hashing', async () => {
    const readmeEntry = liveTree.tree.find((e) => e.path === 'README');
    const blobRes = await fetch(readmeEntry.url, {
      headers: { 'User-Agent': 'GBCoder-Verification-Agent' },
    });
    assert.equal(blobRes.status, 200, 'Expected HTTP 200 for blob object');
    liveBlob = await blobRes.json();
    assert.equal(liveBlob.sha, '980a0d5f19a64b4b30a87d4206aade58726b60e3');

    const contentBuffer = Buffer.from(liveBlob.content, 'base64');
    const contentStr = contentBuffer.toString('utf-8');
    assert.equal(contentStr, 'Hello World!\n');

    // Canonical Git blob hash calculation: sha1("blob " + length + "\0" + content)
    const header = `blob ${contentBuffer.length}\0`;
    const storeBuffer = Buffer.concat([Buffer.from(header, 'utf8'), contentBuffer]);
    const computedBlobSha = crypto.createHash('sha1').update(storeBuffer).digest('hex');

    assert.equal(
      computedBlobSha,
      liveBlob.sha,
      'Calculated local blob SHA must match GitHub remote blob SHA byte-for-byte'
    );
  });

  await t.test('STAGE B06 — Verify canonical Git tree SHA calculation byte-for-byte', async () => {
    const readmeEntry = liveTree.tree.find((e) => e.path === 'README');
    // Git tree entry formatting: <mode> <filename>\0<20-byte-raw-sha>
    const mode = '100644';
    const name = readmeEntry.path;
    const shaBin = Buffer.from(readmeEntry.sha, 'hex');

    const entryHeader = Buffer.from(`${mode} ${name}\0`, 'utf8');
    const entryData = Buffer.concat([entryHeader, shaBin]);

    const treeHeader = Buffer.from(`tree ${entryData.length}\0`, 'utf8');
    const treeStore = Buffer.concat([treeHeader, entryData]);
    const computedTreeSha = crypto.createHash('sha1').update(treeStore).digest('hex');

    assert.equal(
      computedTreeSha,
      liveTree.sha,
      'Calculated local tree SHA must match GitHub remote tree SHA byte-for-byte'
    );
  });

  await t.test('STAGE B07 — Ingest into local LightningFS repository and verify working tree', async () => {
    await fs.promises.mkdir(dir);
    await git.init({ fs, dir, defaultBranch: 'master' });

    // Write blob into git object database
    const contentBuffer = Buffer.from(liveBlob.content, 'base64');
    const writtenBlobOid = await git.writeBlob({
      fs,
      dir,
      blob: contentBuffer,
    });
    assert.equal(writtenBlobOid, '980a0d5f19a64b4b30a87d4206aade58726b60e3');

    // Write tree into git object database
    const writtenTreeOid = await git.writeTree({
      fs,
      dir,
      tree: [
        {
          mode: '100644',
          path: 'README',
          oid: writtenBlobOid,
          type: 'blob',
        },
      ],
    });
    assert.equal(writtenTreeOid, 'b4eecafa9be2f2006ce1b709d6857b07069b4608');

    // Write working tree file
    await fs.promises.writeFile(`${dir}/README`, contentBuffer);

    // Verify file content matches GitHub remote content
    const diskContent = await fs.promises.readFile(`${dir}/README`, 'utf8');
    assert.equal(diskContent, 'Hello World!\n');

    // Verify git status is detected
    const status = await git.status({ fs, dir, filepath: 'README' });
    assert.equal(status, '*added');
  });

  await t.test('STAGE B08 — Prove commit SHA divergence mechanics between REST API and Git wire packfile', async () => {
    // 1. Exact raw commit verification:
    // Raw commit object stored in Git packfile:
    // tree b4eecafa9be2f2006ce1b709d6857b07069b4608
    // parent 553c2077f0edc3d5dc5d17262f6aa498e69d6f8e
    // parent 762941318ee16e59dabbacb1b4049eec22f0d303
    // author The Octocat <octocat@nowhere.com> 1331075210 -0800
    // committer The Octocat <octocat@nowhere.com> 1331075210 -0800
    //
    // Merge pull request #6 from Spaceghost/patch-1
    //
    // New line at end of file.
    const rawCommitString =
      `tree b4eecafa9be2f2006ce1b709d6857b07069b4608\n` +
      `parent 553c2077f0edc3d5dc5d17262f6aa498e69d6f8e\n` +
      `parent 762941318ee16e59dabbacb1b4049eec22f0d303\n` +
      `author The Octocat <octocat@nowhere.com> 1331075210 -0800\n` +
      `committer The Octocat <octocat@nowhere.com> 1331075210 -0800\n\n` +
      `Merge pull request #6 from Spaceghost/patch-1\n\nNew line at end of file.`;

    const rawCommitBytes = Buffer.from(rawCommitString, 'utf8');
    const commitStore = Buffer.concat([
      Buffer.from(`commit ${rawCommitBytes.length}\0`, 'utf8'),
      rawCommitBytes,
    ]);
    const computedRawCommitSha = crypto.createHash('sha1').update(commitStore).digest('hex');

    assert.equal(
      computedRawCommitSha,
      '7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
      'Authentic raw commit byte reconstruction produces exact GitHub commit SHA'
    );

    // 2. Reconstructed commit from GitHub REST API JSON (which discards timezone):
    // GitHub REST returns: "date": "2012-03-06T23:06:50Z" (UTC normalized, discarding -0800).
    const restCommitString =
      `tree b4eecafa9be2f2006ce1b709d6857b07069b4608\n` +
      `parent 553c2077f0edc3d5dc5d17262f6aa498e69d6f8e\n` +
      `parent 762941318ee16e59dabbacb1b4049eec22f0d303\n` +
      `author The Octocat <octocat@nowhere.com> 1331075210 +0000\n` +
      `committer The Octocat <octocat@nowhere.com> 1331075210 +0000\n\n` +
      `Merge pull request #6 from Spaceghost/patch-1\n\nNew line at end of file.`;

    const restBytes = Buffer.from(restCommitString, 'utf8');
    const restStore = Buffer.concat([
      Buffer.from(`commit ${restBytes.length}\0`, 'utf8'),
      restBytes,
    ]);
    const restSha = crypto.createHash('sha1').update(restStore).digest('hex');

    assert.notEqual(
      restSha,
      computedRawCommitSha,
      'REST API reconstruction diverges from wire SHA due to timezone normalization'
    );
  });
});
