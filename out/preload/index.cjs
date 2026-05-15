let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("pi", {
	isElectron: true,
	send: (cmd) => electron.ipcRenderer.invoke("pi:send", cmd),
	onEvent: (cb) => {
		const handler = (_, event) => cb(event);
		electron.ipcRenderer.on("pi:event", handler);
		return () => electron.ipcRenderer.off("pi:event", handler);
	},
	getState: () => electron.ipcRenderer.invoke("pi:state"),
	fs: {
		readFile: (path) => electron.ipcRenderer.invoke("fs:readFile", path),
		writeFile: (path, content) => electron.ipcRenderer.invoke("fs:writeFile", path, content),
		listDir: (path) => electron.ipcRenderer.invoke("fs:listDir", path),
		exists: (path) => electron.ipcRenderer.invoke("fs:exists", path)
	},
	pkg: {
		install: (pkgId) => electron.ipcRenderer.invoke("pi:pkgExec", "install", pkgId),
		uninstall: (pkgId) => electron.ipcRenderer.invoke("pi:pkgExec", "uninstall", pkgId)
	},
	app: {
		getVersion: () => electron.ipcRenderer.invoke("app:version"),
		getCwd: () => electron.ipcRenderer.invoke("app:cwd"),
		quit: () => electron.ipcRenderer.invoke("app:quit")
	},
	onNavigate: (cb) => {
		const handler = (_, screen) => cb(screen);
		electron.ipcRenderer.on("app:navigate", handler);
		return () => electron.ipcRenderer.off("app:navigate", handler);
	},
	onOverlay: (cb) => {
		const handler = (_, overlay) => cb(overlay);
		electron.ipcRenderer.on("app:overlay", handler);
		return () => electron.ipcRenderer.off("app:overlay", handler);
	}
});
//#endregion
