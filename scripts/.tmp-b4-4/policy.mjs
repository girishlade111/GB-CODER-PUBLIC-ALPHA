export const CAPS = {perArtifact:32*1024*1024,total:64*1024*1024,entries:20000,depth:64,ttl:600000,count:2};
export const requireThat=(ok,message)=>{if(!ok)throw Error(message);};
const encoder=new TextEncoder();
function plain(value){requireThat(value&&typeof value==='object'&&[null,Object.prototype].includes(Object.getPrototypeOf(value)),'Unsafe object prototype');for(const d of Object.values(Object.getOwnPropertyDescriptors(value)))requireThat(!d.get&&!d.set,'Accessor not allowed');}
export const sha=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',typeof value==='string'?encoder.encode(value):value))).map(x=>x.toString(16).padStart(2,'0')).join('');
export function canonical(value){
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
}
export async function artifactKey(input){
  for(const key of ['project','incarnation','manifestSha','lockSha','configSha','flags','runtime','api','policy'])requireThat(input[key]!==undefined,'Missing key '+key);
  return sha(canonical(input));
}
export const sameOwner=(a,b)=>Boolean(a&&b&&a.project===b.project&&a.incarnation===b.incarnation&&a.epoch===b.epoch&&a.generation===b.generation&&a.instance===b.instance);
function segment(s){requireThat(s&&s!=='.'&&s!=='..'&&!/[\\/\0:]/.test(s)&&!['__proto__','prototype','constructor'].includes(s),'Unsafe path segment');}
function targetPath(path,target){
  requireThat(typeof target==='string'&&target.length>0&&!target.startsWith('/')&&!/[\\\0:]/.test(target),'Unsafe symlink target');
  const parts=path.split('/').slice(0,-1);
  for(const s of target.split('/')){if(s==='.'||s==='')continue;if(s==='..'){requireThat(parts.length>0,'Escaping symlink');parts.pop();}else{segment(s);parts.push(s);}}
  requireThat(parts.length>0,'Symlink targets root');return parts.join('/');
}
export let lastInventoryTelemetry = null;
export const getLastInventoryTelemetry = () => lastInventoryTelemetry;

function getExt(filename) {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0 || dot === filename.length - 1) return 'no_ext';
  return filename.slice(dot).toLowerCase();
}

function getPackageName(path) {
  const parts = path.split('/');
  if (parts[0] && parts[0].startsWith('@') && parts.length > 1) {
    return parts[0] + '/' + parts[1];
  }
  return parts[0] || 'root';
}

export async function inventory(tree, limits = CAPS) {
  const entries = [], seen = new WeakSet();
  let accounted = 0, fileBytes = 0;
  const startAt = performance.now();

  const telemetry = {
    accountedBytes: 0,
    limitBytes: limits.perArtifact,
    entriesVisited: 0,
    directoriesVisited: 0,
    textFilesVisited: 0,
    binaryFilesVisited: 0,
    symlinksVisited: 0,
    rawTextBytes: 0,
    utf16AccountedTextBytes: 0,
    typedArrayBytes: 0,
    entryOverheadBytes: 0,
    maxObservedDepth: 0,
    fileTypeDistribution: {},
    safePackageAggregates: {},
    rejectionReason: null,
    rejectionPath: null,
    isPartial: false,
    validationElapsedMs: 0
  };

  function recordRejection(err, reason, path) {
    telemetry.accountedBytes = accounted;
    telemetry.rejectionReason = reason;
    telemetry.rejectionPath = path;
    telemetry.isPartial = true;
    telemetry.validationElapsedMs = performance.now() - startAt;
    lastInventoryTelemetry = structuredClone(telemetry);
    err.diagnosticTelemetry = lastInventoryTelemetry;
    return err;
  }

  async function walk(dir, prefix = '', depth = 0) {
    requireThat(dir && typeof dir === 'object' && !Array.isArray(dir), 'Invalid directory');
    plain(dir);
    requireThat(!seen.has(dir), 'Cyclic tree');
    seen.add(dir);
    if (depth > limits.depth) {
      throw recordRejection(new Error('Depth limit'), 'Depth limit', prefix);
    }
    if (depth > telemetry.maxObservedDepth) {
      telemetry.maxObservedDepth = depth;
    }

    for (const name of Object.keys(dir).sort()) {
      segment(name);
      const path = prefix ? prefix + '/' + name : name;
      const node = dir[name];
      requireThat(node && typeof node === 'object' && Object.keys(node).length === 1, 'Invalid node');
      plain(node);
      requireThat(!Object.getOwnPropertySymbols(node).length, 'Symbol node key');

      let e;
      if (Object.hasOwn(node, 'directory')) {
        e = { path, type: 'directory' };
        entries.push(e);
        telemetry.entriesVisited++;
        telemetry.directoriesVisited++;
        await walk(node.directory, path, depth + 1);
      } else {
        requireThat(Object.hasOwn(node, 'file') && node.file && typeof node.file === 'object', 'Invalid file');
        const file = node.file;
        plain(file);
        requireThat(Object.keys(file).length === 1, 'Invalid file shape');

        let fileRawBytes = 0;
        let fileAccountedBytes = 0;

        if (Object.hasOwn(file, 'symlink')) {
          e = { path, type: 'symlink', target: file.symlink, resolved: targetPath(path, file.symlink) };
          telemetry.symlinksVisited++;
        } else {
          requireThat(Object.hasOwn(file, 'contents') && (typeof file.contents === 'string' || file.contents instanceof Uint8Array), 'Invalid file bytes');
          const isString = typeof file.contents === 'string';
          const data = isString ? encoder.encode(file.contents) : file.contents;
          e = { path, type: 'file', bytes: data.byteLength, sha256: await sha(data), representation: isString ? 'text' : 'Uint8Array' };
          fileRawBytes = data.byteLength;
          fileBytes += fileRawBytes;

          if (isString) {
            telemetry.textFilesVisited++;
            telemetry.rawTextBytes += fileRawBytes;
            const utf16Cost = file.contents.length * 2;
            telemetry.utf16AccountedTextBytes += utf16Cost;
            fileAccountedBytes = utf16Cost;
          } else {
            telemetry.binaryFilesVisited++;
            telemetry.typedArrayBytes += fileRawBytes;
            fileAccountedBytes = fileRawBytes;
          }
          accounted += fileAccountedBytes;
        }

        entries.push(e);
        telemetry.entriesVisited++;

        const ext = getExt(name);
        const curExt = telemetry.fileTypeDistribution[ext] || { count: 0, rawBytes: 0, accountedBytes: 0 };
        curExt.count++;
        curExt.rawBytes += fileRawBytes;
        curExt.accountedBytes += fileAccountedBytes;
        telemetry.fileTypeDistribution[ext] = curExt;

        const pkg = getPackageName(path);
        telemetry.safePackageAggregates[pkg] = (telemetry.safePackageAggregates[pkg] || 0) + fileAccountedBytes;
      }

      if (entries.length > limits.entries) {
        throw recordRejection(new Error('Entry limit'), 'Entry limit', path);
      }

      const overhead = encoder.encode(JSON.stringify(e)).byteLength + 128;
      accounted += overhead;
      telemetry.entryOverheadBytes += overhead;
      telemetry.accountedBytes = accounted;

      const pkg = getPackageName(path);
      telemetry.safePackageAggregates[pkg] = (telemetry.safePackageAggregates[pkg] || 0) + overhead;

      const ext = e.type === 'directory' ? 'dir' : getExt(name);
      if (e.type === 'directory') {
        const curExt = telemetry.fileTypeDistribution[ext] || { count: 0, rawBytes: 0, accountedBytes: 0 };
        curExt.count++;
        curExt.accountedBytes += overhead;
        telemetry.fileTypeDistribution[ext] = curExt;
      } else {
        const curExt = telemetry.fileTypeDistribution[ext];
        if (curExt) curExt.accountedBytes += overhead;
      }

      if (accounted > limits.perArtifact) {
        throw recordRejection(new Error('Artifact byte admission limit'), 'Artifact byte admission limit', path);
      }
    }
  }

  try {
    await walk(tree);
  } catch (err) {
    if (!lastInventoryTelemetry || !err.diagnosticTelemetry) {
      recordRejection(err, err.message, telemetry.rejectionPath || 'traversal');
    }
    throw err;
  }

  entries.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  const byPath = new Map(entries.map(e => [e.path, e]));
  for (const e of entries.filter(e => e.type === 'symlink')) {
    let t = e.resolved;
    const visited = new Set([e.path]);
    while (true) {
      requireThat(!visited.has(t), 'Symlink cycle');
      visited.add(t);
      const n = byPath.get(t);
      requireThat(n, 'Missing symlink target');
      if (n.type !== 'symlink') break;
      t = n.resolved;
      requireThat(visited.size <= 64, 'Symlink chain limit');
    }
  }

  telemetry.accountedBytes = accounted;
  telemetry.validationElapsedMs = performance.now() - startAt;
  lastInventoryTelemetry = structuredClone(telemetry);

  return {
    digest: await sha(canonical(entries.map(({ representation, ...e }) => e))),
    entries,
    entryCount: entries.length,
    accountedBytes: accounted,
    fileBytes,
    binaryFiles: entries.filter(e => e.representation === 'Uint8Array').length,
    symlinks: entries.filter(e => e.type === 'symlink').map(e => ({ path: e.path, target: e.target })),
    diagnosticTelemetry: telemetry
  };
}
export const cloneTree=tree=>structuredClone(tree);
export function restoreChoice(record,key,owner,now=Date.now()){
  if(!record)return{path:'reference',reason:'missing'};
  requireThat(!record.quarantined,'Quarantined artifact');
  requireThat(record.project===owner.project&&record.incarnation===owner.incarnation,'Project ownership mismatch');
  if(record.key!==key||now-record.createdAt<0||now-record.createdAt>CAPS.ttl)return{path:'reference',reason:'incompatible-or-expired'};
  return{path:'restore'};
}
export async function verify(record,key,owner){authorize(record,key,owner);const checked=await inventory(record.tree);requireThat(checked.digest===record.digest,'Artifact payload corrupted');return checked;}
export function authorize(record,key,owner,now=Date.now()){
  requireThat(record&&!record.quarantined,'Missing/quarantined artifact');requireThat(record.key===key,'Artifact key mismatch');
  requireThat(record.project===owner.project&&record.incarnation===owner.incarnation,'Project ownership mismatch');
  requireThat(now-record.createdAt>=0&&now-record.createdAt<=CAPS.ttl,'Artifact expired');
  return true;
}
export class MemoryArtifacts{
  records=new Map();
  publish(record,capturedOwner,currentOwner){
    requireThat(sameOwner(capturedOwner,currentOwner),'Retired capture owner');
    requireThat(record.accountedBytes<=CAPS.perArtifact,'Artifact byte admission limit');
    const next=new Map(this.records);next.delete(record.project);next.set(record.project,record);
    while(next.size>CAPS.count||[...next.values()].reduce((n,r)=>n+r.accountedBytes,0)>CAPS.total)next.delete(next.keys().next().value);
    this.records=next;
  }
  take(project){const r=this.records.get(project);if(r){this.records.delete(project);this.records.set(project,r);}return r;}
  quarantine(project){const r=this.records.get(project);if(r)r.quarantined=true;this.records.delete(project);}
}
export async function observed(promise,ms,label,onLate=()=>{}){
  let expired=false,timer;
  const guarded=Promise.resolve(promise).then(value=>{if(expired){onLate();return undefined;}return value;},error=>{if(expired){onLate();return undefined;}throw error;});
  try{return await Promise.race([guarded,new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Error(label+' observation deadline exceeded; underlying operation not cancelled'));},ms);})]);}
  finally{clearTimeout(timer);}
}

export const CAPS_BINARY = { perArtifact: 64 * 1024 * 1024, count: 1, ttl: 600000 };

export function cloneBinary(uint8) {
  requireThat(uint8 instanceof Uint8Array, 'Invalid binary payload');
  return new Uint8Array(uint8.slice());
}

export async function validateBinaryArtifact(payload, limits = CAPS_BINARY) {
  requireThat(payload instanceof Uint8Array, 'Binary artifact must be a Uint8Array');
  requireThat(payload.byteLength > 0, 'Binary artifact must not be empty');
  requireThat(payload.byteLength <= limits.perArtifact, 'Binary artifact byte admission limit');
  const digest = await sha(payload);
  return { byteLength: payload.byteLength, sha256: digest };
}

export function restoreBinaryChoice(record, key, owner, now = Date.now()) {
  if (!record) return { path: 'reference', reason: 'missing' };
  requireThat(!record.quarantined, 'Quarantined binary artifact');
  requireThat(record.project === owner.project && record.incarnation === owner.incarnation, 'Project ownership mismatch');
  if (record.key !== key || now - record.createdAt < 0 || now - record.createdAt > CAPS_BINARY.ttl) {
    return { path: 'reference', reason: 'incompatible-or-expired' };
  }
  return { path: 'restore' };
}

export async function verifyBinary(record, key, owner) {
  authorize(record, key, owner);
  requireThat(record.payload instanceof Uint8Array, 'Stored binary payload invalid');
  const digest = await sha(record.payload);
  requireThat(digest === record.sha256, 'Binary artifact payload corrupted');
  return { byteLength: record.payload.byteLength, sha256: digest };
}

export class BinaryMemoryStore {
  record = null;
  publish(record, capturedOwner, currentOwner, limits = CAPS_BINARY) {
    requireThat(sameOwner(capturedOwner, currentOwner), 'Retired capture owner');
    requireThat(record.payload instanceof Uint8Array, 'Invalid binary payload');
    requireThat(record.payload.byteLength <= limits.perArtifact, 'Binary artifact byte admission limit');
    this.record = record;
  }
  take(project) {
    if (this.record && this.record.project === project) {
      return this.record;
    }
    return null;
  }
  quarantine(project) {
    if (this.record && this.record.project === project) {
      this.record.quarantined = true;
      this.record = null;
    }
  }
  clear() {
    this.record = null;
  }
}

export function resolveExecutableTarget(symlinkPath, target, dependencyRoot = 'node_modules') {
  requireThat(typeof symlinkPath === 'string' && symlinkPath.startsWith(dependencyRoot + '/'), 'Symlink must reside in dependency root');
  const resolved = targetPath(symlinkPath, target);
  requireThat(resolved.startsWith(dependencyRoot + '/'), 'Symlink target escapes dependency root');
  return resolved;
}

export function validatePermissionRepairPath(targetPath, dependencyRoot = 'node_modules') {
  requireThat(typeof targetPath === 'string' && targetPath.length > 0, 'Target path must be a non-empty string');
  requireThat(!targetPath.startsWith('/') && !/[\\\0:]/.test(targetPath), 'Unsafe target path characters');
  const normalized = targetPath.split('/').filter(Boolean);
  const stack = [];
  for (const part of normalized) {
    if (part === '.') continue;
    if (part === '..') {
      requireThat(stack.length > 0, 'Target path escapes root');
      stack.pop();
    } else {
      segment(part);
      stack.push(part);
    }
  }
  const result = stack.join('/');
  requireThat(result.startsWith(dependencyRoot + '/'), 'Permission repair target must be strictly inside ' + dependencyRoot);
  return result;
}

