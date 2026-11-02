// node_modules/@webcontainer/api/dist/internal/constants.js
var DEFAULT_EDITOR_ORIGIN = "https://stackblitz.com";

// node_modules/@webcontainer/api/dist/internal/TypedEventTarget.js
var TypedEventTarget = class {
  _bus = new EventTarget();
  listen(listener) {
    function wrappedListener(event) {
      listener(event.data);
    }
    this._bus.addEventListener("message", wrappedListener);
    return () => this._bus.removeEventListener("message", wrappedListener);
  }
  fireEvent(data) {
    this._bus.dispatchEvent(new MessageEvent("message", { data }));
  }
};

// node_modules/@webcontainer/api/dist/internal/tokens.js
var IGNORED_ERROR = new Error();
IGNORED_ERROR.stack = "";
var accessTokenChangedListeners = new TypedEventTarget();
function addAccessTokenChangedListener(listener) {
  return accessTokenChangedListeners.listen(listener);
}

// node_modules/@webcontainer/api/dist/internal/iframe-url.js
var params = {};
var editorOrigin = null;
var iframeSettings = {
  get editorOrigin() {
    if (editorOrigin == null) {
      editorOrigin = new URL(globalThis.WEBCONTAINER_API_IFRAME_URL ?? DEFAULT_EDITOR_ORIGIN).origin;
    }
    return editorOrigin;
  },
  set editorOrigin(newOrigin) {
    editorOrigin = new URL(newOrigin).origin;
  },
  setQueryParam(key, value) {
    params[key] = value;
  },
  get url() {
    const url = new URL(this.editorOrigin);
    url.pathname = "/headless";
    for (const param in params) {
      url.searchParams.set(param, params[param]);
    }
    url.searchParams.set("version", "1.6.4");
    return url;
  }
};

// node_modules/@webcontainer/api/dist/internal/reset-promise.js
function resettablePromise() {
  let resolve;
  let promise;
  function reset() {
    promise = new Promise((_resolve) => resolve = _resolve);
  }
  reset();
  return {
    get promise() {
      return promise;
    },
    resolve(value) {
      return resolve(value);
    },
    reset
  };
}

// node_modules/@webcontainer/api/dist/internal/auth-state.js
var authState = {
  initialized: false,
  bootCalled: false,
  authComplete: resettablePromise(),
  clientId: "",
  oauthScope: "",
  broadcastChannel: null,
  get editorOrigin() {
    return iframeSettings.editorOrigin;
  },
  tokens: null
};
var authFailedListeners = new TypedEventTarget();
var loggedOutListeners = new TypedEventTarget();
function assertAuthTokens(tokens) {
  if (!tokens) {
    throw new Error("Oops! Tokens is not defined when it always should be.");
  }
}

// node_modules/@webcontainer/api/dist/preview-message-types.js
var PreviewMessageType;
(function(PreviewMessageType2) {
  PreviewMessageType2["UncaughtException"] = "PREVIEW_UNCAUGHT_EXCEPTION";
  PreviewMessageType2["UnhandledRejection"] = "PREVIEW_UNHANDLED_REJECTION";
  PreviewMessageType2["ConsoleError"] = "PREVIEW_CONSOLE_ERROR";
})(PreviewMessageType || (PreviewMessageType = {}));

// node_modules/@webcontainer/api/dist/vendor/index.js
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var comlink_exports = {};
__export(comlink_exports, {
  createEndpoint: () => createEndpoint,
  expose: () => expose,
  proxy: () => proxy,
  proxyMarker: () => proxyMarker,
  releaseProxy: () => releaseProxy,
  transfer: () => transfer,
  transferHandlers: () => transferHandlers,
  windowEndpoint: () => windowEndpoint,
  wrap: () => wrap
});
var proxyMarker = Symbol("Comlink.proxy");
var createEndpoint = Symbol("Comlink.endpoint");
var releaseProxy = Symbol("Comlink.releaseProxy");
var throwMarker = Symbol("Comlink.thrown");
var isObject = (val) => typeof val === "object" && val !== null || typeof val === "function";
var proxyTransferHandler = {
  canHandle: (val) => isObject(val) && val[proxyMarker],
  serialize(obj) {
    const { port1, port2 } = new MessageChannel();
    expose(obj, port1);
    return [port2, [port2]];
  },
  deserialize(port) {
    port.start();
    return wrap(port);
  }
};
var throwTransferHandler = {
  canHandle: (value) => isObject(value) && throwMarker in value,
  serialize({ value }) {
    let serialized;
    if (value instanceof Error) {
      serialized = {
        isError: true,
        value: {
          message: value.message,
          name: value.name,
          stack: value.stack
        }
      };
    } else {
      serialized = { isError: false, value };
    }
    return [serialized, []];
  },
  deserialize(serialized) {
    if (serialized.isError) {
      throw Object.assign(new Error(serialized.value.message), serialized.value);
    }
    throw serialized.value;
  }
};
var transferHandlers = /* @__PURE__ */ new Map([
  ["proxy", proxyTransferHandler],
  ["throw", throwTransferHandler]
]);
function expose(obj, ep = self) {
  ep.addEventListener("message", function callback(ev) {
    if (!ev || !ev.data) {
      return;
    }
    const { id, type, path } = Object.assign({ path: [] }, ev.data);
    const argumentList = (ev.data.argumentList || []).map(fromWireValue);
    let returnValue;
    try {
      const parent = path.slice(0, -1).reduce((obj2, prop) => obj2[prop], obj);
      const rawValue = path.reduce((obj2, prop) => obj2[prop], obj);
      switch (type) {
        case 0:
          {
            returnValue = rawValue;
          }
          break;
        case 1:
          {
            parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
            returnValue = true;
          }
          break;
        case 2:
          {
            returnValue = rawValue.apply(parent, argumentList);
          }
          break;
        case 3:
          {
            const value = new rawValue(...argumentList);
            returnValue = proxy(value);
          }
          break;
        case 4:
          {
            const { port1, port2 } = new MessageChannel();
            expose(obj, port2);
            returnValue = transfer(port1, [port1]);
          }
          break;
        case 5:
          {
            returnValue = void 0;
          }
          break;
      }
    } catch (value) {
      returnValue = { value, [throwMarker]: 0 };
    }
    Promise.resolve(returnValue).catch((value) => {
      return { value, [throwMarker]: 0 };
    }).then((returnValue2) => {
      const [wireValue, transferables] = toWireValue(returnValue2);
      ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
      if (type === 5) {
        ep.removeEventListener("message", callback);
        closeEndPoint(ep);
      }
    });
  });
  if (ep.start) {
    ep.start();
  }
}
function isMessagePort(endpoint) {
  return endpoint.constructor.name === "MessagePort";
}
function closeEndPoint(endpoint) {
  if (isMessagePort(endpoint))
    endpoint.close();
}
function wrap(ep, target) {
  return createProxy(ep, [], target);
}
function throwIfProxyReleased(isReleased) {
  if (isReleased) {
    throw new Error("Proxy has been released and is not useable");
  }
}
function createProxy(ep, path = [], target = function() {
}) {
  let isProxyReleased = false;
  const proxy2 = new Proxy(target, {
    get(_target, prop) {
      throwIfProxyReleased(isProxyReleased);
      if (prop === releaseProxy) {
        return () => {
          return requestResponseMessage(ep, {
            type: 5,
            path: path.map((p) => p.toString())
          }).then(() => {
            closeEndPoint(ep);
            isProxyReleased = true;
          });
        };
      }
      if (prop === "then") {
        if (path.length === 0) {
          return { then: () => proxy2 };
        }
        const r = requestResponseMessage(ep, {
          type: 0,
          path: path.map((p) => p.toString())
        }).then(fromWireValue);
        return r.then.bind(r);
      }
      return createProxy(ep, [...path, prop]);
    },
    set(_target, prop, rawValue) {
      throwIfProxyReleased(isProxyReleased);
      const [value, transferables] = toWireValue(rawValue);
      return requestResponseMessage(ep, {
        type: 1,
        path: [...path, prop].map((p) => p.toString()),
        value
      }, transferables).then(fromWireValue);
    },
    apply(_target, _thisArg, rawArgumentList) {
      throwIfProxyReleased(isProxyReleased);
      const last = path[path.length - 1];
      if (last === createEndpoint) {
        return requestResponseMessage(ep, {
          type: 4
        }).then(fromWireValue);
      }
      if (last === "bind") {
        return createProxy(ep, path.slice(0, -1));
      }
      const [argumentList, transferables] = processArguments(rawArgumentList);
      return requestResponseMessage(ep, {
        type: 2,
        path: path.map((p) => p.toString()),
        argumentList
      }, transferables).then(fromWireValue);
    },
    construct(_target, rawArgumentList) {
      throwIfProxyReleased(isProxyReleased);
      const [argumentList, transferables] = processArguments(rawArgumentList);
      return requestResponseMessage(ep, {
        type: 3,
        path: path.map((p) => p.toString()),
        argumentList
      }, transferables).then(fromWireValue);
    }
  });
  return proxy2;
}
function myFlat(arr) {
  return Array.prototype.concat.apply([], arr);
}
function processArguments(argumentList) {
  const processed = argumentList.map(toWireValue);
  return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
}
var transferCache = /* @__PURE__ */ new WeakMap();
function transfer(obj, transfers) {
  transferCache.set(obj, transfers);
  return obj;
}
function proxy(obj) {
  return Object.assign(obj, { [proxyMarker]: true });
}
function windowEndpoint(w, context = self, targetOrigin = "*") {
  return {
    postMessage: (msg, transferables) => w.postMessage(msg, targetOrigin, transferables),
    addEventListener: context.addEventListener.bind(context),
    removeEventListener: context.removeEventListener.bind(context)
  };
}
function toWireValue(value) {
  for (const [name, handler] of transferHandlers) {
    if (handler.canHandle(value)) {
      const [serializedValue, transferables] = handler.serialize(value);
      return [
        {
          type: 3,
          name,
          value: serializedValue
        },
        transferables
      ];
    }
  }
  return [
    {
      type: 0,
      value
    },
    transferCache.get(value) || []
  ];
}
function fromWireValue(value) {
  switch (value.type) {
    case 3:
      return transferHandlers.get(value.name).deserialize(value.value);
    case 0:
      return value.value;
  }
}
function requestResponseMessage(ep, msg, transfers) {
  return new Promise((resolve) => {
    const id = generateUUID();
    ep.addEventListener("message", function l(ev) {
      if (!ev.data || !ev.data.id || ev.data.id !== id) {
        return;
      }
      ep.removeEventListener("message", l);
      resolve(ev.data);
    });
    if (ep.start) {
      ep.start();
    }
    ep.postMessage(Object.assign({ id }, msg), transfers);
  });
}
function generateUUID() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}

// node_modules/@webcontainer/api/dist/utils/is-preview-message.js
var PREVIEW_MESSAGE_TYPES = [
  PreviewMessageType.ConsoleError,
  PreviewMessageType.UncaughtException,
  PreviewMessageType.UnhandledRejection
];
function isPreviewMessage(data) {
  if (data == null || typeof data !== "object") {
    return false;
  }
  if (!("type" in data) || !PREVIEW_MESSAGE_TYPES.includes(data.type)) {
    return false;
  }
  return true;
}

// node_modules/@webcontainer/api/dist/utils/null-prototype.js
function nullPrototype(source) {
  const prototype = /* @__PURE__ */ Object.create(null);
  if (!source) {
    return prototype;
  }
  return Object.assign(prototype, source);
}

// node_modules/@webcontainer/api/dist/utils/file-system.js
function toInternalFileSystemTree(tree) {
  const newTree = { d: {} };
  for (const name of Object.keys(tree)) {
    const entry = tree[name];
    if ("file" in entry) {
      if ("symlink" in entry.file) {
        newTree.d[name] = { f: { l: entry.file.symlink } };
        continue;
      }
      const contents = entry.file.contents;
      const stringContents = typeof contents === "string" ? contents : toLatin1(contents);
      const binary = typeof contents === "string" ? {} : { b: true };
      newTree.d[name] = { f: { c: stringContents, ...binary } };
      continue;
    }
    const newEntry = toInternalFileSystemTree(entry.directory);
    newTree.d[name] = newEntry;
  }
  return newTree;
}
function toExternalFileSystemTree(tree) {
  const newTree = nullPrototype();
  if ("f" in tree) {
    throw new Error("It is not possible to export a single file in the JSON format.");
  }
  if ("d" in tree) {
    for (const name of Object.keys(tree.d)) {
      const entry = tree.d[name];
      if ("d" in entry) {
        newTree[name] = nullPrototype({
          directory: toExternalFileSystemTree(entry)
        });
      } else if ("f" in entry) {
        if ("c" in entry.f) {
          newTree[name] = nullPrototype({
            file: nullPrototype({
              contents: entry.f.b ? fromBinaryString(entry.f.c) : entry.f.c
            })
          });
        } else if ("l" in entry.f) {
          newTree[name] = nullPrototype({
            file: nullPrototype({
              symlink: entry.f.l
            })
          });
        }
      }
    }
  }
  return newTree;
}
function fromBinaryString(s) {
  const encoded = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    encoded[i] = s[i].charCodeAt(0);
  }
  return encoded;
}
function toLatin1(bytes) {
  let decoded = "";
  for (let i = 0; i < bytes.length; i++) {
    decoded += String.fromCharCode(bytes[i]);
  }
  return decoded;
}

// node_modules/@webcontainer/api/dist/index.js
var bootPromise = null;
var cachedServerPromise = null;
var cachedBootOptions = {};
var decoder = new TextDecoder();
var encoder = new TextEncoder();
var WebContainer = class _WebContainer {
  _instance;
  _runtimeInfo;
  /**
   * Gives access to the underlying file system.
   */
  fs;
  /** @internal */
  static _instance = null;
  /** @internal */
  static _teardownPromise = null;
  _tornDown = false;
  _unsubscribeFromTokenChangedListener = () => {
  };
  /** @internal */
  constructor(_instance, fs, previewScript, _runtimeInfo) {
    this._instance = _instance;
    this._runtimeInfo = _runtimeInfo;
    this.fs = new FileSystemAPIClient(fs);
    if (authState.initialized) {
      this._unsubscribeFromTokenChangedListener = addAccessTokenChangedListener((accessToken) => {
        this._instance.setCredentials({ accessToken, editorOrigin: authState.editorOrigin });
      });
      (async () => {
        await authState.authComplete.promise;
        if (this._tornDown) {
          return;
        }
        assertAuthTokens(authState.tokens);
        await this._instance.setCredentials({
          accessToken: authState.tokens.access,
          editorOrigin: authState.editorOrigin
        });
      })().catch((error) => {
        console.error(error);
      });
    }
  }
  async spawn(command2, optionsOrArgs, options) {
    let args = [];
    if (Array.isArray(optionsOrArgs)) {
      args = optionsOrArgs;
    } else {
      options = optionsOrArgs;
    }
    let output = void 0;
    let outputStream = new ReadableStream();
    if (options?.output !== false) {
      const result = streamWithPush();
      output = result.push;
      outputStream = result.stream;
    }
    let stdout = void 0;
    let stdoutStream;
    let stderr = void 0;
    let stderrStream;
    const wrappedOutput = proxyListener(binaryListener(output));
    const wrappedStdout = proxyListener(binaryListener(stdout));
    const wrappedStderr = proxyListener(binaryListener(stderr));
    const process = await this._instance.run({
      command: command2,
      args,
      cwd: options?.cwd,
      env: options?.env,
      terminal: options?.terminal
    }, wrappedStdout, wrappedStderr, wrappedOutput);
    return new WebContainerProcessImpl(process, outputStream, stdoutStream, stderrStream);
  }
  async export(path, options) {
    const serializeOptions = {
      format: options?.format ?? "json",
      includes: options?.includes,
      excludes: options?.excludes,
      external: true
    };
    const result = await this._instance.serialize(path, serializeOptions);
    if (serializeOptions.format === "json") {
      const data = JSON.parse(decoder.decode(result));
      return toExternalFileSystemTree(data);
    }
    return result;
  }
  on(event, listener) {
    if (event === "preview-message") {
      const originalListener = listener;
      listener = (message) => {
        if (isPreviewMessage(message)) {
          originalListener(message);
        }
      };
    }
    const { listener: wrapped, subscribe } = syncSubscription(listener);
    return subscribe(this._instance.on(event, comlink_exports.proxy(wrapped)));
  }
  /**
   * Mounts a tree of files into the filesystem. This can be specified as a tree object ({@link FileSystemTree})
   * or as a binary snapshot generated by [`@webcontainer/snapshot`](https://www.npmjs.com/package/@webcontainer/snapshot).
   *
   * @param snapshotOrTree - A tree of files, or a binary snapshot. Note that binary payloads will be transferred.
   * @param options - Additional options.
   */
  mount(snapshotOrTree, options) {
    const payload = snapshotOrTree instanceof Uint8Array ? snapshotOrTree : snapshotOrTree instanceof ArrayBuffer ? new Uint8Array(snapshotOrTree) : encoder.encode(JSON.stringify(toInternalFileSystemTree(snapshotOrTree)));
    return this._instance.loadFiles(comlink_exports.transfer(payload, [payload.buffer]), {
      mountPoints: options?.mountPoint
    });
  }
  /**
   * Set a custom script to be injected into all previews. When this function is called, every
   * future page reload will contain the provided script tag on all HTML responses.
   *
   * Note:
   *
   * When this function resolves, every preview reloaded _after_ will have the new script.
   * Existing preview have to be explicitely reloaded.
   *
   * To reload a preview you can use `reloadPreview`.
   *
   * @param scriptSrc Source for the script tag.
   * @param options Options to define which type of script this is.
   */
  setPreviewScript(scriptSrc, options) {
    return this._instance.setPreviewScript(scriptSrc, options);
  }
  /**
   * The default value of the `PATH` environment variable for processes started through {@link spawn}.
   */
  get path() {
    return this._runtimeInfo.path;
  }
  /**
   * The full path to the working directory (see {@link FileSystemAPI}).
   */
  get workdir() {
    return this._runtimeInfo.cwd;
  }
  /**
   * Destroys the WebContainer instance, turning it unusable, and releases its resources. After this,
   * a new WebContainer instance can be obtained by calling {@link WebContainer.boot | `boot`}.
   *
   * All entities derived from this instance (e.g. processes, the file system, etc.) also become unusable
   * after calling this method.
   */
  teardown() {
    if (this._tornDown) {
      throw new Error("WebContainer already torn down");
    }
    this._tornDown = true;
    this._unsubscribeFromTokenChangedListener();
    const teardownFn = async () => {
      try {
        await this.fs._teardown();
        await this._instance.teardown();
      } finally {
        this._instance[comlink_exports.releaseProxy]();
        if (_WebContainer._instance === this) {
          _WebContainer._instance = null;
        }
      }
    };
    _WebContainer._teardownPromise = teardownFn();
  }
  /**
   * Boots a WebContainer. Only a single instance of WebContainer can be booted concurrently
   * (see {@link WebContainer.teardown | `teardown`}).
   *
   * Booting WebContainer is an expensive operation.
   */
  static async boot(options = {}) {
    await this._teardownPromise;
    _WebContainer._teardownPromise = null;
    const { workdirName } = options;
    if (window.crossOriginIsolated && options.coep === "none") {
      console.warn(`A Cross-Origin-Embedder-Policy header is required in cross origin isolated environments.
Set the 'coep' option to 'require-corp'.`);
    }
    if (workdirName?.includes("/") || workdirName === ".." || workdirName === ".") {
      throw new Error("workdirName should be a valid folder name");
    }
    authState.bootCalled = true;
    while (bootPromise) {
      await bootPromise;
    }
    if (_WebContainer._instance) {
      throw new Error("Only a single WebContainer instance can be booted");
    }
    const instancePromise = unsynchronizedBoot(options);
    bootPromise = instancePromise.catch(() => {
    });
    try {
      const instance = await instancePromise;
      _WebContainer._instance = instance;
      return instance;
    } finally {
      bootPromise = null;
    }
  }
};
var DIR_ENTRY_TYPE_FILE = 1;
var DIR_ENTRY_TYPE_DIR = 2;
var DirEntImpl = class {
  name;
  _type;
  constructor(name, _type) {
    this.name = name;
    this._type = _type;
  }
  isFile() {
    return this._type === DIR_ENTRY_TYPE_FILE;
  }
  isDirectory() {
    return this._type === DIR_ENTRY_TYPE_DIR;
  }
};
var FSWatcher = class {
  _apiClient;
  _path;
  _options;
  _listener;
  _wrappedListener;
  _watcher;
  _closed = false;
  constructor(_apiClient, _path, _options, _listener) {
    this._apiClient = _apiClient;
    this._path = _path;
    this._options = _options;
    this._listener = _listener;
    this._apiClient._watchers.add(this);
    this._wrappedListener = (event, filename) => {
      if (this._listener && !this._closed) {
        this._listener(event, filename);
      }
    };
    this._apiClient._fs.watch(this._path, this._options, proxyListener(this._wrappedListener)).then((_watcher) => {
      this._watcher = _watcher;
      if (this._closed) {
        return this._teardown();
      }
      return void 0;
    }).catch(console.error);
  }
  async close() {
    if (!this._closed) {
      this._closed = true;
      this._apiClient._watchers.delete(this);
      await this._teardown();
    }
  }
  /**
   * @internal
   */
  async _teardown() {
    await this._watcher?.close().finally(() => {
      this._watcher?.[comlink_exports.releaseProxy]();
    });
  }
};
var WebContainerProcessImpl = class {
  output;
  input;
  exit;
  _process;
  stdout;
  stderr;
  constructor(process, output, stdout, stderr) {
    this.output = output;
    this._process = process;
    this.input = new WritableStream({
      write: (data) => {
        this._getProcess()?.write(data).catch(() => {
        });
      }
    });
    this.exit = this._onExit();
    this.stdout = stdout;
    this.stderr = stderr;
  }
  kill() {
    this._process?.kill();
  }
  resize(dimensions) {
    this._getProcess()?.resize(dimensions);
  }
  async _onExit() {
    try {
      return await this._process.onExit;
    } finally {
      this._process?.[comlink_exports.releaseProxy]();
      this._process = null;
    }
  }
  _getProcess() {
    if (this._process == null) {
      console.warn("This process already exited");
    }
    return this._process;
  }
};
var FileSystemAPIClient = class {
  _fs;
  _watchers = /* @__PURE__ */ new Set([]);
  constructor(fs) {
    this._fs = fs;
  }
  rm(...args) {
    return this._fs.rm(...args);
  }
  async readFile(path, encoding) {
    return await this._fs.readFile(path, encoding);
  }
  async rename(oldPath, newPath) {
    return await this._fs.rename(oldPath, newPath);
  }
  async writeFile(path, data, options) {
    if (data instanceof Uint8Array) {
      const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      data = comlink_exports.transfer(new Uint8Array(buffer), [buffer]);
    }
    await this._fs.writeFile(path, data, options);
  }
  async readdir(path, options) {
    const result = await this._fs.readdir(path, options);
    if (isStringArray(result)) {
      return result;
    }
    if (isTypedArrayCollection(result)) {
      return result;
    }
    const entries = result.map((entry) => new DirEntImpl(entry.name, entry["Symbol(type)"]));
    return entries;
  }
  async mkdir(path, options) {
    return await this._fs.mkdir(path, options);
  }
  watch(path, options, listener) {
    if (typeof options === "function") {
      listener = options;
      options = null;
    }
    return new FSWatcher(this, path, options, listener);
  }
  /**
   * @internal
   */
  async _teardown() {
    this._fs[comlink_exports.releaseProxy]();
    await Promise.all([...this._watchers].map((watcher) => watcher.close()));
  }
};
async function unsynchronizedBoot(options) {
  const { serverPromise } = serverFactory(options);
  const server = await serverPromise;
  const instance = await server.build({
    host: window.location.host,
    version: "1.6.4",
    workdirName: options.workdirName,
    forwardPreviewErrors: options.forwardPreviewErrors
  });
  const [fs, previewScript, runtimeInfo] = await Promise.all([
    instance.fs(),
    instance.previewScript(),
    instance.runtimeInfo()
  ]);
  return new WebContainer(instance, fs, previewScript, runtimeInfo);
}
function binaryListener(listener) {
  if (listener == null) {
    return void 0;
  }
  return (data) => {
    if (data instanceof Uint8Array) {
      listener(decoder.decode(data));
    } else if (data == null) {
      listener(null);
    }
  };
}
function proxyListener(listener) {
  if (listener == null) {
    return void 0;
  }
  return comlink_exports.proxy(listener);
}
function serverFactory(options) {
  if (cachedServerPromise != null) {
    if (options.coep !== cachedBootOptions.coep) {
      console.warn(`Attempting to boot WebContainer with 'coep: ${options.coep}'`);
      console.warn(`First boot had 'coep: ${cachedBootOptions.coep}', new settings will not take effect!`);
    }
    return { serverPromise: cachedServerPromise };
  }
  if (options.coep) {
    iframeSettings.setQueryParam("coep", options.coep);
  }
  if (options.experimentalNode) {
    iframeSettings.setQueryParam("experimental_node", "1");
  }
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.setAttribute("allow", "cross-origin-isolated");
  const url = iframeSettings.url;
  iframe.src = url.toString();
  const { origin } = url;
  cachedBootOptions = { ...options };
  cachedServerPromise = new Promise((resolve) => {
    const onMessage = (event) => {
      if (event.origin !== origin) {
        return;
      }
      const { data } = event;
      if (data.type === "init") {
        resolve(comlink_exports.wrap(event.ports[0]));
        return;
      }
      if (data.type === "warning") {
        console[data.level].call(console, data.message);
        return;
      }
    };
    window.addEventListener("message", onMessage);
  });
  document.body.insertBefore(iframe, null);
  return { serverPromise: cachedServerPromise };
}
function isStringArray(list) {
  return typeof list[0] === "string";
}
function isTypedArrayCollection(list) {
  return list[0] instanceof Uint8Array;
}
function streamWithPush() {
  let controller = null;
  const stream = new ReadableStream({
    start(controller_) {
      controller = controller_;
    }
  });
  const push = (item) => {
    if (item != null) {
      controller?.enqueue(item);
    } else {
      controller?.close();
      controller = null;
    }
  };
  return { stream, push };
}
function syncSubscription(listener) {
  let stopped = false;
  let unsubscribe = () => {
  };
  const wrapped = (...args) => {
    if (stopped) {
      return;
    }
    listener(...args);
  };
  return {
    subscribe(promise) {
      promise.then((unsubscribe_) => {
        unsubscribe = unsubscribe_;
        if (stopped) {
          unsubscribe();
        }
      });
      return () => {
        stopped = true;
        unsubscribe();
      };
    },
    listener: wrapped
  };
}

// scripts/.tmp-b4-4/policy.mjs
var CAPS = { perArtifact: 32 * 1024 * 1024, total: 64 * 1024 * 1024, entries: 2e4, depth: 64, ttl: 6e5, count: 2 };
var requireThat = (ok, message) => {
  if (!ok) throw Error(message);
};
var encoder2 = new TextEncoder();
var sha = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", typeof value === "string" ? encoder2.encode(value) : value))).map((x) => x.toString(16).padStart(2, "0")).join("");
function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  return "{" + Object.keys(value).sort().map((k) => JSON.stringify(k) + ":" + canonical(value[k])).join(",") + "}";
}
async function artifactKey(input) {
  for (const key of ["project", "incarnation", "manifestSha", "lockSha", "configSha", "flags", "runtime", "api", "policy"]) requireThat(input[key] !== void 0, "Missing key " + key);
  return sha(canonical(input));
}
var sameOwner = (a, b) => Boolean(a && b && a.project === b.project && a.incarnation === b.incarnation && a.epoch === b.epoch && a.generation === b.generation && a.instance === b.instance);
function segment(s) {
  requireThat(s && s !== "." && s !== ".." && !/[\\/\0:]/.test(s) && !["__proto__", "prototype", "constructor"].includes(s), "Unsafe path segment");
}
function targetPath(path, target) {
  requireThat(typeof target === "string" && target.length > 0 && !target.startsWith("/") && !/[\\\0:]/.test(target), "Unsafe symlink target");
  const parts = path.split("/").slice(0, -1);
  for (const s of target.split("/")) {
    if (s === "." || s === "") continue;
    if (s === "..") {
      requireThat(parts.length > 0, "Escaping symlink");
      parts.pop();
    } else {
      segment(s);
      parts.push(s);
    }
  }
  requireThat(parts.length > 0, "Symlink targets root");
  return parts.join("/");
}
function authorize(record, key, owner, now = Date.now()) {
  requireThat(record && !record.quarantined, "Missing/quarantined artifact");
  requireThat(record.key === key, "Artifact key mismatch");
  requireThat(record.project === owner.project && record.incarnation === owner.incarnation, "Project ownership mismatch");
  requireThat(now - record.createdAt >= 0 && now - record.createdAt <= CAPS.ttl, "Artifact expired");
  return true;
}
async function observed(promise, ms, label, onLate = () => {
}) {
  let expired = false, timer;
  const guarded = Promise.resolve(promise).then((value) => {
    if (expired) {
      onLate();
      return void 0;
    }
    return value;
  }, (error) => {
    if (expired) {
      onLate();
      return void 0;
    }
    throw error;
  });
  try {
    return await Promise.race([guarded, new Promise((_, reject) => {
      timer = setTimeout(() => {
        expired = true;
        reject(Error(label + " observation deadline exceeded; underlying operation not cancelled"));
      }, ms);
    })]);
  } finally {
    clearTimeout(timer);
  }
}
var CAPS_BINARY = { perArtifact: 64 * 1024 * 1024, count: 1, ttl: 6e5 };
function cloneBinary(uint8) {
  requireThat(uint8 instanceof Uint8Array, "Invalid binary payload");
  return new Uint8Array(uint8.slice());
}
async function validateBinaryArtifact(payload, limits = CAPS_BINARY) {
  requireThat(payload instanceof Uint8Array, "Binary artifact must be a Uint8Array");
  requireThat(payload.byteLength > 0, "Binary artifact must not be empty");
  requireThat(payload.byteLength <= limits.perArtifact, "Binary artifact byte admission limit");
  const digest = await sha(payload);
  return { byteLength: payload.byteLength, sha256: digest };
}
function restoreBinaryChoice(record, key, owner, now = Date.now()) {
  if (!record) return { path: "reference", reason: "missing" };
  requireThat(!record.quarantined, "Quarantined binary artifact");
  requireThat(record.project === owner.project && record.incarnation === owner.incarnation, "Project ownership mismatch");
  if (record.key !== key || now - record.createdAt < 0 || now - record.createdAt > CAPS_BINARY.ttl) {
    return { path: "reference", reason: "incompatible-or-expired" };
  }
  return { path: "restore" };
}
async function verifyBinary(record, key, owner) {
  authorize(record, key, owner);
  requireThat(record.payload instanceof Uint8Array, "Stored binary payload invalid");
  const digest = await sha(record.payload);
  requireThat(digest === record.sha256, "Binary artifact payload corrupted");
  return { byteLength: record.payload.byteLength, sha256: digest };
}
var BinaryMemoryStore = class {
  record = null;
  publish(record, capturedOwner, currentOwner, limits = CAPS_BINARY) {
    requireThat(sameOwner(capturedOwner, currentOwner), "Retired capture owner");
    requireThat(record.payload instanceof Uint8Array, "Invalid binary payload");
    requireThat(record.payload.byteLength <= limits.perArtifact, "Binary artifact byte admission limit");
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
};
function resolveExecutableTarget(symlinkPath, target, dependencyRoot = "node_modules") {
  requireThat(typeof symlinkPath === "string" && symlinkPath.startsWith(dependencyRoot + "/"), "Symlink must reside in dependency root");
  const resolved = targetPath(symlinkPath, target);
  requireThat(resolved.startsWith(dependencyRoot + "/"), "Symlink target escapes dependency root");
  return resolved;
}
function validatePermissionRepairPath(targetPath2, dependencyRoot = "node_modules") {
  requireThat(typeof targetPath2 === "string" && targetPath2.length > 0, "Target path must be a non-empty string");
  requireThat(!targetPath2.startsWith("/") && !/[\\\0:]/.test(targetPath2), "Unsafe target path characters");
  const normalized = targetPath2.split("/").filter(Boolean);
  const stack = [];
  for (const part of normalized) {
    if (part === ".") continue;
    if (part === "..") {
      requireThat(stack.length > 0, "Target path escapes root");
      stack.pop();
    } else {
      segment(part);
      stack.push(part);
    }
  }
  const result = stack.join("/");
  requireThat(result.startsWith(dependencyRoot + "/"), "Permission repair target must be strictly inside " + dependencyRoot);
  return result;
}

// scripts/.tmp-b4-4/browser.mjs
var DIAG_SCRIPT = `
const fs = require('fs');
const path = require('path');
function inspect(p) {
  try {
    const lstat = fs.lstatSync(p);
    let target = null, stat = null, statError = null;
    if (lstat.isSymbolicLink()) {
      target = fs.readlinkSync(p);
      try {
        stat = fs.statSync(p);
      } catch (e) {
        statError = e.message;
      }
    } else {
      stat = lstat;
    }
    return {
      exists: true,
      path: p,
      isSymbolicLink: lstat.isSymbolicLink(),
      isFile: lstat.isFile(),
      lstatModeOctal: (lstat.mode & 0o777).toString(8),
      target,
      statModeOctal: stat ? (stat.mode & 0o777).toString(8) : null,
      statIsFile: stat ? stat.isFile() : null,
      isExecutable: stat ? Boolean(stat.mode & 0o111) : false,
      statError
    };
  } catch (e) {
    return { exists: false, path: p, error: e.message };
  }
}
const symlinkInfo = inspect('node_modules/.bin/vite');
const targetPath = symlinkInfo.target
  ? path.posix.normalize(path.posix.join(path.posix.dirname('node_modules/.bin/vite'), symlinkInfo.target))
  : 'node_modules/vite/bin/vite.js';
const targetInfo = inspect(targetPath);
console.log(JSON.stringify({ symlinkInfo, targetInfo, targetPath }));
`;
var fixtures = await (await fetch("/fixtures.json")).json();
var binaryStore = new BinaryMemoryStore();
var allInstances = /* @__PURE__ */ new WeakSet();
var active = null;
var current = null;
var bootCount = 0;
var instanceCount = 0;
var retiredCount = 0;
var aborted = false;
var flags = ["ci", "--ignore-scripts", "--no-audit", "--no-fund", "--fetch-retries=0"];
var state = {
  api: "1.6.4",
  format: "binary",
  samples: [],
  events: [],
  memoryCoverage: "performance.memory.usedJSHeapSize with precise-memory flag: page JS heap only; excludes worker/Wasm/native memory; sampled checkpoints, not a guaranteed peak"
};
function memory(sample, label) {
  const n = performance.memory?.usedJSHeapSize;
  sample.memory.push({ at: Date.now(), label, pageJsHeapBytes: Number.isFinite(n) ? n : null });
  return n;
}
function owned(owner) {
  requireThat(!aborted && sameOwner(owner, current) && active === owner.instance, "Owner retired during asynchronous operation");
}
function sourceTree(files) {
  const root = {};
  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split("/");
    let node = root;
    for (const p of parts.slice(0, -1)) node = (node[p] ??= { directory: {} }).directory;
    node[parts.at(-1)] = { file: { contents } };
  }
  return root;
}
async function command(wc, owner, sample, label, program, args = [], wait = true) {
  owned(owner);
  const record = { label, program, args, invokedAt: Date.now(), output: "" };
  sample.processes.push(record);
  const process = await wc.spawn(program, args, {
    env: {
      npm_config_userconfig: wc.workdir + "/.empty-user.npmrc",
      npm_config_globalconfig: wc.workdir + "/.empty-global.npmrc"
    }
  });
  const read = (async () => {
    const reader = process.output.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = typeof value === "string" ? value : new TextDecoder().decode(value);
        record.output = (record.output + text).slice(-65536);
      }
    } catch (e) {
      record.readError = String(e);
    }
  })();
  const exit = process.exit.then((code2) => {
    record.exitCode = code2;
    record.exitAt = Date.now();
    state.events.push({ type: "process_exit", sample: sample.index, label, code: code2, at: Date.now() });
    return code2;
  }, (error) => {
    record.exitRejected = String(error);
    record.exitAt = Date.now();
    state.events.push({ type: "process_exit_rejected", sample: sample.index, label, error: String(error), at: Date.now(), retired: !sameOwner(owner, current) });
    return null;
  });
  owned(owner);
  if (!wait) return { process, record, read, exit };
  const code = await exit;
  await read;
  owned(owner);
  record.durationMs = Date.now() - record.invokedAt;
  requireThat(code === 0, label + " exit " + String(code) + " " + (record.exitRejected || record.output.slice(-1500)));
  return record;
}
async function exactSource(wc, fixture) {
  for (const [path, text] of Object.entries(fixture.files)) {
    requireThat(await wc.fs.readFile(path, "utf8") === text, "Source changed: " + path);
  }
  const other = fixture.project === "A" ? "vue" : "react";
  try {
    await wc.fs.readFile("project-" + other + ".txt");
    throw Error("Cross-project source present");
  } catch (e) {
    requireThat(String(e).includes("ENOENT"), "Unexpected cross-project path result: " + e);
  }
}
async function retire() {
  if (!active) return;
  const wc = active;
  const old = current;
  current = null;
  active = null;
  state.events.push({ type: "retire", sample: old?.epoch, at: Date.now() });
  retiredCount++;
  wc.teardown();
  const iframe = document.querySelector("iframe");
  if (iframe) {
    iframe.src = "about:blank";
    iframe.removeAttribute("src");
  }
  if (state.samples.length) {
    memory(state.samples.at(-1), "after-cleanup");
  }
}
async function begin(specOrIndex) {
  const spec = typeof specOrIndex === "object" && specOrIndex !== null ? specOrIndex : { index: specOrIndex, kind: "react", role: specOrIndex === 0 ? "producer" : "control", label: `boot-${specOrIndex + 1}` };
  const { index, kind = "react", role = "producer", label = `obs-${index + 1}` } = spec;
  requireThat(index === state.samples.length && index < 18 && !aborted, "Invalid observation sequence: index " + index + ", length " + state.samples.length);
  await retire();
  const fixture = fixtures[kind];
  requireThat(fixture, "Unknown fixture kind: " + kind);
  const sample = {
    index: index + 1,
    label,
    kind,
    project: fixture.project,
    incarnation: fixture.incarnation,
    role,
    start: Date.now(),
    status: "RUNNING",
    phase: "boot",
    processes: [],
    memory: [],
    proof: false
  };
  state.samples.push(sample);
  try {
    memory(sample, "before-boot");
    const bootAt = performance.now();
    bootCount++;
    const wc = await WebContainer.boot({ coep: "require-corp", workdirName: "gb-b4-4-" + kind + "-" + label.toLowerCase() });
    requireThat(!allInstances.has(wc), "Runtime reused");
    allInstances.add(wc);
    instanceCount++;
    active = wc;
    const owner = {
      project: fixture.project,
      incarnation: fixture.incarnation,
      epoch: index + 1,
      generation: index + 1,
      instance: wc
    };
    current = owner;
    sample.owner = {
      project: owner.project,
      incarnation: owner.incarnation,
      epoch: owner.epoch,
      generation: owner.generation,
      runtimeId: instanceCount
    };
    sample.bootMs = performance.now() - bootAt;
    sample.freshInstance = true;
    requireThat(retiredCount === index, "Prior runtime not retired: retired " + retiredCount + ", expected " + index);
    const mountAt = performance.now();
    await wc.mount(sourceTree(fixture.files));
    owned(owner);
    sample.mountMs = performance.now() - mountAt;
    await exactSource(wc, fixture);
    memory(sample, "after-boot-and-mount");
    sample.phase = "compatibility";
    const versions = await command(wc, owner, sample, "node-compatibility", "node", [
      "-e",
      "console.log(JSON.stringify({versions:process.versions,platform:process.platform,arch:process.arch,workdir:process.cwd()}))"
    ]);
    const npm = await command(wc, owner, sample, "npm-version", "npm", ["--version"]);
    const node = JSON.parse(versions.output.trim());
    const compatibility = {
      versions: node.versions,
      platform: node.platform,
      arch: node.arch,
      npm: npm.output.trim(),
      api: "1.6.4"
    };
    sample.compatibility = compatibility;
    sample.workdir = node.workdir;
    requireThat(await sha(await wc.fs.readFile("package.json")) === fixture.manifestSha, "Manifest digest mismatch");
    requireThat(await sha(await wc.fs.readFile("package-lock.json")) === fixture.lockSha, "Lock digest mismatch");
    requireThat(await sha(await wc.fs.readFile(".npmrc")) === fixture.configSha, "Effective npmrc mismatch");
    const key = await artifactKey({
      project: fixture.project,
      incarnation: fixture.incarnation,
      manifestSha: fixture.manifestSha,
      lockSha: fixture.lockSha,
      configSha: fixture.configSha,
      flags,
      runtime: compatibility,
      api: "1.6.4",
      policy: 2,
      format: "binary"
    });
    sample.key = key;
    if (role === "producer") {
      sample.phase = "install";
      const install = await command(wc, owner, sample, "clean-install", "npm", flags);
      sample.installMs = install.durationMs;
      sample.installExit = install.exitCode;
      requireThat(sample.processes.every((p) => p.exitCode === 0), "Process still active before capture");
      await exactSource(wc, fixture);
      requireThat(await sha(await wc.fs.readFile("package-lock.json")) === fixture.lockSha, "Install modified root lock");
      const bytes = Uint8Array.from({ length: 1024 }, (_, i) => i % 256);
      await wc.fs.writeFile("node_modules/.b4-4-byte-probe.bin", bytes);
      const probeSha = await sha(bytes);
      sample.probeSha256 = probeSha;
      await command(wc, owner, sample, "internal-symlink-probe", "node", [
        "-e",
        "require('fs').symlinkSync('.b4-4-byte-probe.bin','node_modules/.b4-4-internal-link')"
      ]);
      await wc.fs.writeFile("node_modules/.b4-4-diag.cjs", DIAG_SCRIPT);
      sample.phase = "producer-permission-diagnostics";
      const producerDiag = await command(wc, owner, sample, "producer-permission-diagnostics", "node", [
        "node_modules/.b4-4-diag.cjs"
      ]);
      sample.producerDiagnostics = JSON.parse(producerDiag.output.trim());
      requireThat(sample.producerDiagnostics.symlinkInfo.exists, "Producer .bin/vite missing");
      requireThat(sample.producerDiagnostics.targetInfo.exists, "Producer target file missing");
      requireThat(sample.producerDiagnostics.targetInfo.isExecutable, "Producer target file not executable");
      sample.phase = "capture";
      const before = memory(sample, "capture-before");
      const at = performance.now();
      const captured = await observed((async () => {
        const exportAt = performance.now();
        const binaryPayload = await wc.export("node_modules", { format: "binary" });
        owned(owner);
        sample.exportMs = performance.now() - exportAt;
        memory(sample, "after-export");
        const hashAt = performance.now();
        const validation = await validateBinaryArtifact(binaryPayload, CAPS_BINARY);
        sample.hashingMs = performance.now() - hashAt;
        sample.binaryByteLength = validation.byteLength;
        sample.binarySha256 = validation.sha256;
        return {
          payload: binaryPayload,
          sha256: validation.sha256,
          byteLength: validation.byteLength,
          probeSha256: probeSha,
          key,
          project: fixture.project,
          incarnation: fixture.incarnation,
          createdAt: Date.now(),
          producer: sample.owner
        };
      })(), 1e4, "binary-capture");
      owned(owner);
      sample.captureMs = performance.now() - at;
      memory(sample, "capture-after");
      requireThat(sample.captureMs <= 1e4, "Capture elapsed-time ceiling");
      const after = performance.memory?.usedJSHeapSize;
      sample.captureJsHeapDelta = Number.isFinite(before) && Number.isFinite(after) ? after - before : null;
      requireThat(sample.captureJsHeapDelta === null || sample.captureJsHeapDelta <= 128 * 1024 * 1024, "Measured page JS heap admission ceiling");
      owned(owner);
      binaryStore.publish(captured, owner, current);
      sample.status = "PRODUCER_SUCCESS";
      sample.phase = "producer-complete";
      return { status: "PRODUCER_SUCCESS", index: sample.index, label, sample };
    } else if (role === "control") {
      sample.phase = "verify-empty";
      try {
        await wc.fs.readdir("node_modules");
        throw Error("Control dependency destination not fresh");
      } catch (e) {
        requireThat(String(e).includes("ENOENT"), "Nonempty control destination");
      }
      sample.phase = "install";
      const before = memory(sample, "install-before");
      const install = await command(wc, owner, sample, "clean-install", "npm", flags);
      sample.installMs = install.durationMs;
      sample.installExit = install.exitCode;
      memory(sample, "install-after");
      requireThat(sample.processes.every((p) => p.exitCode === 0), "Process still active before dev server");
      await exactSource(wc, fixture);
      requireThat(await sha(await wc.fs.readFile("package-lock.json")) === fixture.lockSha, "Install modified root lock");
      sample.phase = "server";
      let readyResolve;
      const ready = new Promise((r) => readyResolve = r);
      wc.on("server-ready", (port, url2) => {
        if (!sameOwner(owner, current)) {
          state.events.push({ type: "stale_server_ignored", sample: sample.index, at: Date.now() });
          return;
        }
        if (port === 5173) {
          sample.serverReadyAt = Date.now();
          sample.serverUrl = url2;
          readyResolve(url2);
        }
      });
      const dev = await command(wc, owner, sample, "dev-server", "npm", ["run", "dev"], false);
      sample.devInvokedAt = dev.record.invokedAt;
      const url = await observed(ready, Math.max(1, sample.start + 24e4 - Date.now()), "server-ready");
      owned(owner);
      sample.serverReadyMs = sample.serverReadyAt - sample.devInvokedAt;
      requireThat(dev.record.exitCode === void 0 && !dev.record.exitRejected, "Dev server exited before DOM");
      document.querySelector("iframe").src = url;
      sample.phase = "awaiting-real-dom";
      return { status: "AWAITING_DOM", marker: fixture.marker, index: sample.index, label };
    } else if (role === "candidate") {
      sample.phase = "restore";
      const record = binaryStore.take(fixture.project);
      requireThat(record, "Missing binary artifact for project " + fixture.project);
      const age = Date.now() - record.createdAt;
      sample.artifactAgeMs = age;
      requireThat(age >= 0 && age <= 6e5, "ARTIFACT_EXPIRED: age " + age + "ms > 600000ms");
      const choice = restoreBinaryChoice(record, key, owner, Date.now(), CAPS_BINARY);
      requireThat(choice.path === "restore", "Binary artifact ineligible: " + choice.reason);
      const before = memory(sample, "restore-before");
      const at = performance.now();
      await observed((async () => {
        const preAt = performance.now();
        await verifyBinary(record, key, owner);
        owned(owner);
        sample.preRestoreValidationMs = performance.now() - preAt;
        try {
          await wc.fs.readdir("node_modules");
          throw Error("Consumer dependency destination not fresh");
        } catch (e) {
          requireThat(String(e).includes("ENOENT"), "Nonempty consumer destination");
        }
        await wc.fs.mkdir("node_modules");
        owned(owner);
        const cloneAt = performance.now();
        const payloadCopy = cloneBinary(record.payload);
        sample.cloneMs = performance.now() - cloneAt;
        const mountAt2 = performance.now();
        await wc.mount(payloadCopy, { mountPoint: "node_modules" });
        owned(owner);
        sample.binaryMountMs = performance.now() - mountAt2;
        memory(sample, "after-mount");
        const validateAt = performance.now();
        const nmEntries = await wc.fs.readdir("node_modules");
        requireThat(nmEntries.length > 0, "Restored node_modules is empty");
        sample.restoredTopLevelCount = nmEntries.length;
        const restoredProbe = await wc.fs.readFile("node_modules/.b4-4-byte-probe.bin");
        requireThat(await sha(restoredProbe) === record.probeSha256, "Restored binary probe mismatch");
        const linkProbe = await wc.fs.readFile("node_modules/.b4-4-internal-link");
        requireThat(await sha(linkProbe) === record.probeSha256, "Restored internal symlink read mismatch");
        const frameworkPkgName = fixture.project === "A" ? "react" : "vue";
        const frameworkPkg = JSON.parse(await wc.fs.readFile("node_modules/" + frameworkPkgName + "/package.json", "utf8"));
        requireThat(frameworkPkg.name === frameworkPkgName, frameworkPkgName + " package metadata missing");
        const vitePkg = JSON.parse(await wc.fs.readFile("node_modules/vite/package.json", "utf8"));
        requireThat(vitePkg.name === "vite", "Vite package metadata missing");
        await exactSource(wc, fixture);
        owned(owner);
        sample.postRestoreValidationMs = performance.now() - validateAt;
      })(), 15e3, "restore-validation");
      owned(owner);
      sample.restoreMs = performance.now() - at;
      memory(sample, "restore-after");
      requireThat(sample.restoreMs <= 15e3, "Restore elapsed-time ceiling");
      sample.phase = "consumer-pre-correction-diagnostics";
      try {
        await wc.fs.readFile("node_modules/.b4-4-diag.cjs");
      } catch {
        await wc.fs.writeFile("node_modules/.b4-4-diag.cjs", DIAG_SCRIPT);
      }
      const consumerDiag = await command(wc, owner, sample, "consumer-pre-correction-diagnostics", "node", [
        "node_modules/.b4-4-diag.cjs"
      ]);
      sample.consumerDiagnosticsBefore = JSON.parse(consumerDiag.output.trim());
      const executableLost = !sample.consumerDiagnosticsBefore?.targetInfo?.isExecutable;
      sample.permissionDifferences = {
        consumerTargetModeBefore: sample.consumerDiagnosticsBefore?.targetInfo?.statModeOctal,
        executableLost
      };
      if (executableLost) {
        sample.phase = "permission-correction";
        const rawTarget = sample.consumerDiagnosticsBefore.symlinkInfo.target || "../vite/bin/vite.js";
        const verifiedTarget = resolveExecutableTarget("node_modules/.bin/vite", rawTarget);
        validatePermissionRepairPath(verifiedTarget);
        sample.verifiedTarget = verifiedTarget;
        const chmodStart = performance.now();
        let chmodMethod = "none";
        try {
          const cliResult = await command(wc, owner, sample, "test-chmod-cli", "chmod", ["+x", verifiedTarget]);
          chmodMethod = "chmod-cli";
          sample.chmodCliExit = cliResult.exitCode;
        } catch (cliErr) {
          sample.chmodCliError = String(cliErr);
          await command(wc, owner, sample, "chmod-node-api", "node", [
            "-e",
            `require('fs').chmodSync(${JSON.stringify(verifiedTarget)}, 0o755)`
          ]);
          chmodMethod = "node-chmodSync";
        }
        sample.chmodMethod = chmodMethod;
        sample.chmodDurationMs = performance.now() - chmodStart;
        const postDiag = await command(wc, owner, sample, "consumer-post-correction-diagnostics", "node", [
          "node_modules/.b4-4-diag.cjs"
        ]);
        sample.consumerDiagnosticsAfter = JSON.parse(postDiag.output.trim());
        requireThat(sample.consumerDiagnosticsAfter.targetInfo.isExecutable, "Executable permission correction failed to restore execute bit");
        await exactSource(wc, fixture);
        owned(owner);
      } else {
        sample.chmodDurationMs = 0;
      }
      sample.restoreTotalOverheadMs = (sample.preRestoreValidationMs || 0) + (sample.cloneMs || 0) + (sample.binaryMountMs || 0) + (sample.postRestoreValidationMs || 0) + (sample.chmodDurationMs || 0);
      sample.phase = "server";
      let readyResolve;
      const ready = new Promise((r) => readyResolve = r);
      wc.on("server-ready", (port, url2) => {
        if (!sameOwner(owner, current)) {
          state.events.push({ type: "stale_server_ignored", sample: sample.index, at: Date.now() });
          return;
        }
        if (port === 5173) {
          sample.serverReadyAt = Date.now();
          sample.serverUrl = url2;
          readyResolve(url2);
        }
      });
      const dev = await command(wc, owner, sample, "dev-server", "npm", ["run", "dev"], false);
      sample.devInvokedAt = dev.record.invokedAt;
      const url = await observed(ready, Math.max(1, sample.start + 24e4 - Date.now()), "server-ready");
      owned(owner);
      sample.serverReadyMs = sample.serverReadyAt - sample.devInvokedAt;
      requireThat(dev.record.exitCode === void 0 && !dev.record.exitRejected, "Dev server exited before DOM");
      document.querySelector("iframe").src = url;
      sample.phase = "awaiting-real-dom";
      return { status: "AWAITING_DOM", marker: fixture.marker, index: sample.index, label };
    } else {
      throw Error("Unknown observation role: " + role);
    }
  } catch (error) {
    sample.status = "FAIL";
    sample.error = String(error);
    sample.failurePhase = sample.phase;
    if (sample.role === "candidate") binaryStore.quarantine(sample.project);
    throw error;
  }
}
async function finish(specOrIndex) {
  const index = typeof specOrIndex === "object" && specOrIndex !== null ? specOrIndex.index : specOrIndex;
  const sample = state.samples[index];
  requireThat(sample, "Sample not found at index " + index);
  const fixture = fixtures[sample.kind];
  const owner = current;
  owned(owner);
  requireThat(owner.project === sample.project && owner.epoch === sample.owner.epoch && owner.generation === sample.owner.generation, "Finish owner mismatch");
  if (sample.role === "producer") {
    sample.status = "PASS";
    sample.phase = "producer-complete";
    sample.totalMs = Date.now() - sample.start;
    return summary();
  }
  requireThat(sample.phase === "awaiting-real-dom" && sample.serverReadyAt, "No genuine ready event");
  sample.domVerifiedAt = Date.now();
  sample.realDomMs = sample.domVerifiedAt - sample.start;
  sample.totalMs = sample.domVerifiedAt - sample.start;
  sample.proof = {
    project: current.project,
    epoch: current.epoch,
    generation: current.generation,
    runtimeId: sample.owner.runtimeId,
    role: sample.role,
    source: sample.role === "candidate" ? "validated-binary-restore-and-real-dom" : "clean-install-and-real-dom"
  };
  sample.status = "PASS";
  sample.phase = "ready";
  memory(sample, "ready");
  sample.installDispatchCount = sample.processes.filter((p) => p.label === "clean-install").length;
  if (sample.role === "candidate") {
    requireThat(sample.installDispatchCount === 0, "Unexpected npm install ran in candidate");
  } else if (sample.role === "control") {
    requireThat(sample.installDispatchCount === 1, "Control clean-install did not run");
  }
  return summary();
}
function summary() {
  return structuredClone({
    ...state,
    bootCount,
    retainedBinaryArtifact: binaryStore.record ? {
      project: binaryStore.record.project,
      key: binaryStore.record.key,
      sha256: binaryStore.record.sha256,
      byteLength: binaryStore.record.byteLength,
      createdAt: binaryStore.record.createdAt
    } : null,
    runtimeInstances: instanceCount,
    retiredRuntimeCount: retiredCount
  });
}
function clearStore() {
  binaryStore.clear();
  state.events.push({ type: "store_cleared", at: Date.now() });
  return { cleared: true, record: binaryStore.record };
}
async function abort() {
  aborted = true;
  await retire();
  binaryStore.clear();
  await new Promise((r) => setTimeout(r, 200));
  return summary();
}
globalThis.__b44 = { begin, finish, summary, abort, clearStore, retire };
