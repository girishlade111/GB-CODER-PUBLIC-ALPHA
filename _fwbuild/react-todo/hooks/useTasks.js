      import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
      import { useLocalStorage } from './useLocalStorage.js';
      import {
        DEFAULT_PRIORITY,
        collectTags,
        createTask,
        isTaskArray,
        normalisePriority,
        parseTags,
        selectVisibleTasks,
        summarise,
      } from '../utils/todoStore.js';

      const STORAGE_KEY = 'gbcoder.react-todo.tasks.v1';

      /** Matches the `task-out` duration in styles.css. */
      const EXIT_MS = 240;

      /**
       * All task state and every mutation, in one hook.
       *
       * Components below stay presentational: `TaskItem` receives a task and a handful
       * of callbacks and knows nothing about storage, filters or sorting.
       */
      export function useTasks() {
        const [tasks, setTasks] = useLocalStorage(STORAGE_KEY, [], isTaskArray);
        const [filter, setFilter] = useState('all');
        const [query, setQuery] = useState('');
        const [sort, setSort] = useState('created');
        const [tag, setTag] = useState('all');

        /** Last deleted task, held so the toast can offer a real undo. */
        const [undoEntry, setUndoEntry] = useState(null);
        /** Id of the row currently playing its exit animation. */
        const [leavingId, setLeavingId] = useState(null);

        const exitTimer = useRef(null);

        // Refs mirror state so callbacks can read the latest value without being
        // re-created on every keystroke.
        const tasksRef = useRef(tasks);
        tasksRef.current = tasks;
        const undoRef = useRef(undoEntry);
        undoRef.current = undoEntry;

        // A pending exit must never commit into an unmounted tree.
        useEffect(() => () => window.clearTimeout(exitTimer.current), []);

        const addTask = useCallback(
          (draft) => {
            const task = createTask(draft);
            setTasks((current) => [task, ...current]);
            return task;
          },
          [setTasks],
        );

        const updateTask = useCallback(
          (id, patch) => {
            const clean = { ...patch };
            if ('priority' in clean) clean.priority = normalisePriority(clean.priority);
            if ('tags' in clean) clean.tags = parseTags(clean.tags);
            if ('title' in clean) {
              const title = String(clean.title).trim();
              // A blank title is a rejected edit, not a task called "".
              if (!title) return;
              clean.title = title;
            }
            if ('notes' in clean) clean.notes = String(clean.notes).trim();

            setTasks((current) =>
              current.map((task) =>
                task.id === id ? { ...task, ...clean, updatedAt: new Date().toISOString() } : task,
              ),
            );
          },
          [setTasks],
        );

        const toggleTask = useCallback(
          (id) => {
            setTasks((current) =>
              current.map((task) =>
                task.id === id
                  ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
                  : task,
              ),
            );
          },
          [setTasks],
        );

        /**
         * Deletion is two-phase: mark the row as leaving, then drop it once the exit
         * animation has finished. That is why removal is deferred by EXIT_MS rather
         * than happening on click.
         */
        const removeTask = useCallback(
          (id) => {
            const list = tasksRef.current;
            const target = list.find((task) => task.id === id);
            if (!target) return;

            window.clearTimeout(exitTimer.current);
            setUndoEntry({ task: target, index: list.indexOf(target) });
            setLeavingId(id);

            exitTimer.current = window.setTimeout(() => {
              setTasks((current) => current.filter((task) => task.id !== id));
              setLeavingId(null);
              exitTimer.current = null;
            }, EXIT_MS);
          },
          [setTasks],
        );

        /** Cancels a pending exit, and re-inserts if the removal already committed. */
        const undoDelete = useCallback(() => {
          window.clearTimeout(exitTimer.current);
          exitTimer.current = null;
          setLeavingId(null);

          const entry = undoRef.current;
          setUndoEntry(null);
          if (!entry) return;

          setTasks((current) => {
            if (current.some((task) => task.id === entry.task.id)) return current;
            const next = current.slice();
            next.splice(Math.min(entry.index, next.length), 0, entry.task);
            return next;
          });
        }, [setTasks]);

        const dismissUndo = useCallback(() => setUndoEntry(null), []);

        const clearCompleted = useCallback(() => {
          setTasks((current) => current.filter((task) => !task.completed));
        }, [setTasks]);

        const toggleAll = useCallback(() => {
          setTasks((current) => {
            if (current.length === 0) return current;
            const everyDone = current.every((task) => task.completed);
            const stamp = new Date().toISOString();
            return current.map((task) => ({ ...task, completed: !everyDone, updatedAt: stamp }));
          });
        }, [setTasks]);

        /**
         * Moves a task one slot up or down in the stored order. Moves past either end
         * are no-ops rather than errors, so holding a button down is harmless.
         */
        const moveTask = useCallback(
          (id, direction) => {
            setTasks((current) => {
              const index = current.findIndex((task) => task.id === id);
              if (index === -1) return current;
              const target = index + direction;
              if (target < 0 || target >= current.length) return current;
              const next = current.slice();
              const [moved] = next.splice(index, 1);
              next.splice(target, 0, moved);
              return next;
            });
          },
          [setTasks],
        );

        const visible = useMemo(
          () => selectVisibleTasks(tasks, { filter, query, sort, tag }),
          [tasks, filter, query, sort, tag],
        );

        const stats = useMemo(() => summarise(tasks), [tasks]);
        const tags = useMemo(() => collectTags(tasks), [tasks]);

        return {
          tasks,
          visible,
          stats,
          tags,
          filter,
          setFilter,
          query,
          setQuery,
          sort,
          setSort,
          tag,
          setTag,
          leavingId,
          undoEntry,
          addTask,
          updateTask,
          toggleTask,
          removeTask,
          undoDelete,
          dismissUndo,
          clearCompleted,
          toggleAll,
          moveTask,
          /** The list is empty because of a search, not because there is nothing to do. */
          isSearching: query.trim().length > 0 || tag !== 'all',
          defaultPriority: DEFAULT_PRIORITY,
        };
      }