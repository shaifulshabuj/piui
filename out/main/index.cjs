//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let path = require("path");
path = __toESM(path);
let fs = require("fs");
fs = __toESM(fs);
let child_process = require("child_process");
let os = require("os");
os = __toESM(os);
let fs_promises = require("fs/promises");
fs_promises = __toESM(fs_promises);
//#region electron/piProcess.ts
function findPiBinary() {
	const home = os.homedir();
	const candidates = [
		"/opt/homebrew/bin/pi",
		"/usr/local/bin/pi",
		path.join(home, ".local/bin/pi"),
		path.join(home, ".cargo/bin/pi"),
		path.join(home, "bin/pi"),
		"/usr/bin/pi"
	];
	for (const p of candidates) try {
		fs.accessSync(p, fs.constants.X_OK);
		return p;
	} catch {}
	for (const shell of ["/bin/zsh", "/bin/bash"]) try {
		const p = (0, child_process.execSync)(`${shell} -l -c 'command -v pi'`, {
			timeout: 5e3,
			encoding: "utf8",
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		}).trim();
		if (p && p.length > 0) return p;
	} catch {}
	return null;
}
var JsonlReader = class {
	buf = Buffer.alloc(0);
	feed(chunk) {
		this.buf = Buffer.concat([this.buf, chunk]);
		const results = [];
		let idx;
		while ((idx = this.buf.indexOf(10)) !== -1) {
			const line = this.buf.slice(0, idx).toString("utf8");
			this.buf = this.buf.slice(idx + 1);
			if (line.trim()) try {
				results.push(JSON.parse(line));
			} catch {}
		}
		return results;
	}
};
var PiProcessManager = class {
	proc = null;
	reader = new JsonlReader();
	window = null;
	binaryPath = null;
	available = false;
	restarting = false;
	setWindow(win) {
		this.window = win;
	}
	async start() {
		this.binaryPath = findPiBinary();
		if (!this.binaryPath) {
			console.warn("[pi] binary not found; UI runs in mock/browser mode");
			return;
		}
		this.available = true;
		this.spawnProcess();
	}
	spawnProcess() {
		if (!this.binaryPath || this.restarting) return;
		console.log("[pi] spawning", this.binaryPath, "--mode rpc");
		this.proc = (0, child_process.spawn)(this.binaryPath, ["--mode", "rpc"], { stdio: [
			"pipe",
			"pipe",
			"pipe"
		] });
		this.proc.stdout.on("data", (chunk) => {
			const events = this.reader.feed(chunk);
			for (const event of events) this.window?.webContents.send("pi:event", event);
		});
		this.proc.stderr.on("data", (d) => {
			console.error("[pi stderr]", d.toString().trim());
		});
		this.proc.on("exit", (code, signal) => {
			console.log("[pi] exited", {
				code,
				signal
			});
			this.proc = null;
			if (this.available) {
				this.restarting = true;
				setTimeout(() => {
					this.restarting = false;
					this.spawnProcess();
				}, 2e3);
			}
		});
	}
	send(cmd) {
		if (!this.proc?.stdin.writable) {
			console.warn("[pi] process not running; command dropped:", cmd);
			return;
		}
		this.proc.stdin.write(JSON.stringify(cmd) + "\n");
	}
	isAvailable() {
		return this.available && !!this.proc;
	}
	getBinaryPath() {
		return this.binaryPath;
	}
	getStatus() {
		return {
			available: this.available,
			running: !!this.proc,
			binaryPath: this.binaryPath
		};
	}
	stop() {
		this.available = false;
		this.proc?.kill("SIGTERM");
		this.proc = null;
	}
};
var piManager = new PiProcessManager();
//#endregion
//#region electron/ipc.ts
var PI_HOME = path.join(os.homedir(), ".pi");
var ALLOWED_ROOTS = [
	PI_HOME,
	path.join(os.homedir(), ".config", "pi"),
	process.cwd()
];
function isPathAllowed(filePath) {
	const resolved = path.resolve(filePath);
	return ALLOWED_ROOTS.some((root) => resolved === root || resolved.startsWith(root + path.sep));
}
/** Resolve a relative path against ~/.pi */
function resolvePiPath(relOrAbs) {
	if (path.isAbsolute(relOrAbs)) return relOrAbs;
	return path.join(PI_HOME, relOrAbs);
}
function registerIpcHandlers() {
	electron.ipcMain.handle("pi:send", async (_, cmd) => {
		piManager.send(cmd);
	});
	electron.ipcMain.handle("pi:state", async () => {
		return piManager.getStatus();
	});
	electron.ipcMain.handle("fs:readFile", async (_, filePath) => {
		const resolved = resolvePiPath(filePath);
		if (!isPathAllowed(resolved)) throw new Error(`Access denied: ${filePath}`);
		return fs_promises.readFile(resolved, "utf8");
	});
	electron.ipcMain.handle("fs:writeFile", async (_, filePath, content) => {
		const resolved = resolvePiPath(filePath);
		if (!isPathAllowed(resolved)) throw new Error(`Access denied: ${filePath}`);
		await fs_promises.mkdir(path.dirname(resolved), { recursive: true });
		await fs_promises.writeFile(resolved, content, "utf8");
	});
	electron.ipcMain.handle("fs:listDir", async (_, dirPath) => {
		const resolved = resolvePiPath(dirPath);
		if (!isPathAllowed(resolved)) throw new Error(`Access denied: ${dirPath}`);
		try {
			return (await fs_promises.readdir(resolved, { withFileTypes: true })).map((e) => ({
				name: e.name,
				isDir: e.isDirectory()
			}));
		} catch {
			return [];
		}
	});
	electron.ipcMain.handle("fs:exists", async (_, filePath) => {
		const resolved = resolvePiPath(filePath);
		if (!isPathAllowed(resolved)) return false;
		try {
			await fs_promises.access(resolved);
			return true;
		} catch {
			return false;
		}
	});
	electron.ipcMain.handle("pi:pkgExec", async (_, subCmd, pkgId) => {
		if (!pkgId.match(/^[a-zA-Z0-9@/._:-]{1,200}$/)) throw new Error("Invalid package id");
		return new Promise((resolve, reject) => {
			const proc = (0, child_process.spawn)(piManager.getBinaryPath() ?? "pi", [subCmd, pkgId], {
				stdio: [
					"ignore",
					"pipe",
					"pipe"
				],
				env: { ...process.env }
			});
			let out = "";
			proc.stdout?.on("data", (d) => {
				out += d.toString();
			});
			proc.stderr?.on("data", (d) => {
				out += d.toString();
			});
			proc.on("close", (code) => {
				if (code === 0) resolve(out.trim());
				else reject(new Error(out.trim() || `pi ${subCmd} exited ${code}`));
			});
			proc.on("error", reject);
		});
	});
	electron.ipcMain.handle("app:version", async () => electron.app.getVersion());
	electron.ipcMain.handle("app:cwd", async () => process.cwd());
	electron.ipcMain.handle("app:quit", async () => electron.app.quit());
}
//#endregion
//#region electron/menu.ts
function buildMenu(mainWindow) {
	const nav = (screen) => mainWindow.webContents.send("app:navigate", screen);
	const overlay = (name) => mainWindow.webContents.send("app:overlay", name);
	const template = [
		{
			label: electron.app.name,
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{ role: "services" },
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideOthers" },
				{ role: "unhide" },
				{ type: "separator" },
				{ role: "quit" }
			]
		},
		{
			label: "File",
			submenu: [
				{
					label: "New Session",
					accelerator: "CmdOrCtrl+N",
					click: () => nav("chat")
				},
				{
					label: "Session Tree",
					accelerator: "CmdOrCtrl+T",
					click: () => nav("tree")
				},
				{ type: "separator" },
				{ role: "close" }
			]
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "selectAll" }
			]
		},
		{
			label: "View",
			submenu: [
				{
					label: "Model Picker",
					accelerator: "Ctrl+L",
					click: () => nav("model")
				},
				{
					label: "Command Palette",
					accelerator: "CmdOrCtrl+K",
					click: () => overlay("command-palette")
				},
				{
					label: "Settings / Theme",
					accelerator: "CmdOrCtrl+,",
					click: () => nav("theme")
				},
				{ type: "separator" },
				{
					label: "Packages",
					click: () => nav("packages")
				},
				{
					label: "Prompt Templates",
					click: () => nav("prompts")
				},
				{
					label: "Context Editor",
					click: () => nav("context")
				},
				{
					label: "Share & Export",
					click: () => nav("share")
				},
				{ type: "separator" },
				{ role: "toggleDevTools" },
				{ role: "reload" },
				{ role: "togglefullscreen" }
			]
		},
		{
			label: "Window",
			role: "windowMenu"
		}
	];
	electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(template));
}
//#endregion
//#region electron/main.ts
electron.app.setName("pi");
var mainWindow = null;
/** electron-vite dev outputs index.js, prod outputs index.cjs — handle both */
function resolvePreload() {
	const cjs = (0, path.join)(__dirname, "../preload/index.cjs");
	const js = (0, path.join)(__dirname, "../preload/index.js");
	if ((0, fs.existsSync)(cjs)) return cjs;
	if ((0, fs.existsSync)(js)) return js;
	console.warn("[pi] preload not found at expected paths:", cjs, js);
	return cjs;
}
async function createWindow() {
	mainWindow = new electron.BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		titleBarStyle: "hiddenInset",
		trafficLightPosition: {
			x: 14,
			y: 11
		},
		backgroundColor: "#0e0d0b",
		show: false,
		webPreferences: {
			preload: resolvePreload(),
			contextIsolation: true,
			nodeIntegration: false
		}
	});
	mainWindow.webContents.on("did-fail-load", (_e, code, desc) => {
		console.error("[pi] renderer failed to load:", code, desc);
	});
	if (process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
		mainWindow.webContents.openDevTools();
	} else mainWindow.loadFile((0, path.join)(__dirname, "../renderer/index.html"));
	mainWindow.once("ready-to-show", () => mainWindow.show());
	setTimeout(() => {
		if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
	}, 4e3);
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("http")) electron.shell.openExternal(url);
		return { action: "deny" };
	});
	piManager.setWindow(mainWindow);
	buildMenu(mainWindow);
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}
electron.app.whenReady().then(async () => {
	registerIpcHandlers();
	await createWindow();
	await piManager.start();
	electron.app.on("activate", () => {
		if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
electron.app.on("window-all-closed", () => {
	piManager.stop();
	if (process.platform !== "darwin") electron.app.quit();
});
//#endregion
