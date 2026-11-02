const fs=require('fs');const p='src/components/Console/TerminalTab.tsx';let s=fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
s=s.replace('  webcontainerService,','  webcontainerService,\n  type StartupOwner,').replace('  const pendingFingerprintRef = useRef<string | null>(null);\n','').replace('    epoch: number;','    owner: StartupOwner;');
s=s.replace('(cmd: string, epoch: number, termMessage?: string)','(cmd: string, owner: StartupOwner, termMessage?: string)');
s=s.replace('      const isReady =','      if (!webcontainerService.isStartupOwner(owner)) return;\n      const isReady =');
s=s.replace('        shell.write(`${cmd}\\n`);','        if (webcontainerService.automaticCommandDispatched(owner)) shell.write(`${cmd}\\n`);').replace('{ cmd, epoch, termMessage }','{ cmd, owner, termMessage }').replace('pendingAutoStartCmdRef.current.epoch === epoch','pendingAutoStartCmdRef.current.owner === owner && webcontainerService.isStartupOwner(owner)');
let a=s.indexOf("          webcontainerService.setStartupStage('error', {",s.indexOf('const dispatchWhenShellReady')),b=s.indexOf('          pendingAutoStartCmdRef.current = null;',a);if(a<0||b<0)throw Error('watchdog');s=s.slice(0,a)+'          webcontainerService.markStartupUnknown(owner);\n'+s.slice(b);
a=s.indexOf('  /** Spawns or reconnects');s=s.slice(0,a)+`  // One owner-bound dispatch path shared by initial startup and explicit restart.
  const queueAutomaticStart = useCallback(async (proj: MultiFileProject, owner: StartupOwner, message: string) => {
    if (!webcontainerService.isStartupOwner(owner)) return;
    const fingerprint = webcontainerService.computeDependencyFingerprint(proj.files, proj.dependencies, proj.projectType);
    if (webcontainerService.hasStartedProject(fingerprint) || webcontainerService.isDevServerRunning(owner.projectId || undefined)) return;
    const check = await webcontainerService.needsDependencyInstall(proj.files, proj.dependencies, proj.projectType);
    if (!webcontainerService.isStartupOwner(owner)) return;
    const operation = webcontainerService.beginAutomaticStartup(fingerprint, check.needsInstall, owner);
    if (!operation) return;
    webcontainerService.markProjectStarted(fingerprint);
    dispatchWhenShellReady(check.needsInstall ? 'npm install --prefer-offline && npm run dev' : 'npm run dev', operation,
      '\\r\\n' + message + (check.needsInstall ? ': Installing dependencies & starting dev server...\\r\\n' : ': Dependencies verified; starting dev server...\\r\\n'));
  }, [dispatchWhenShellReady]);

`+s.slice(a);
s=s.replace('    isStartingShellRef.current = true;\n    try {','    isStartingShellRef.current = true;\n    let startupOwner: StartupOwner | null = null;\n    try {').replace('      // Mount project files into virtual filesystem if files exist','      startupOwner = webcontainerService.captureStartupOwner();\n\n      // Mount project files into virtual filesystem if files exist');
s=s.replace('      // Spawn or reconnect interactive shell','      if (!webcontainerService.isStartupScope(startupOwner)) return;\n      const shellOwner = webcontainerService.captureStartupOwner();\n      startupOwner = shellOwner;\n\n      // Spawn or reconnect interactive shell').replace('        onData: (chunk) => {\n          term.write(chunk);','        onData: (chunk) => {\n          if (!webcontainerService.isRuntimeOwner(shellOwner)) return;\n          term.write(chunk);').replace('if (pending.epoch === webcontainerService.getSessionEpoch())','if (webcontainerService.isStartupOwner(pending.owner) && webcontainerService.automaticCommandDispatched(pending.owner))');
a=s.indexOf('          // 1. Package install success confirmation');b=s.indexOf('\n        },\n        forceRestart,',a);if(a<0||b<0)throw Error('output');s=s.slice(0,a)+s.slice(b);
s=s.replace('      webcontainerShellRef.current = shell;','      if (!webcontainerService.isStartupOwner(shellOwner)) { shell.disconnect(); return; }\n      webcontainerShellRef.current = shell;');
a=s.indexOf('        const fingerprint = webcontainerService.computeDependencyFingerprint(',s.indexOf('// StackBlitz auto-start'));b=s.indexOf('\n      }\n    } catch (err)',a);if(a<0||b<0)throw Error('initial');s=s.slice(0,a)+"        await queueAutomaticStart(projToStart, shellOwner, 'Auto-Start');"+s.slice(b);
s=s.replace('    } catch (err) {\n      clearShellPromptWatchdog();','    } catch (err) {\n      if (startupOwner && !webcontainerService.isStartupScope(startupOwner)) return;\n      clearShellPromptWatchdog();').replace('[autoStartProject, dispatchWhenShellReady, clearShellPromptWatchdog]','[autoStartProject, queueAutomaticStart, clearShellPromptWatchdog]');
a=s.indexOf('              const fingerprint = webcontainerService.computeDependencyFingerprint(',s.indexOf('const triggerDevServerRestart'));b=s.indexOf('\n            } catch (err)',a);if(a<0||b<0)throw Error('restart');s=s.slice(0,a)+'              await queueAutomaticStart(currentProj, webcontainerService.captureStartupOwner(), reason);'+s.slice(b);
s=s.replace('            } catch (err) {\n              clearShellPromptWatchdog();','            } catch (err) {\n              if (restartEpoch !== webcontainerService.getSessionEpoch()) return;\n              clearShellPromptWatchdog();').replace('[mode, dispatchWhenShellReady, clearShellPromptWatchdog]','[mode, queueAutomaticStart, clearShellPromptWatchdog]');
fs.writeFileSync(p,s);
