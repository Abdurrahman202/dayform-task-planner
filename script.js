"use strict";

(() => {
  const STORAGE_KEY = "dayform-tasks-v1";

  const categories = {
    personal: "Personal",
    work: "Work",
    learning: "Learning",
  };

  const priorities = {
    normal: "Normal",
    high: "High",
    low: "Low",
  };

  const form = document.querySelector("#task-form");
  const titleInput = document.querySelector("#task-title");
  const categoryInput = document.querySelector("#task-category");
  const priorityInput = document.querySelector("#task-priority");
  const taskList = document.querySelector("#task-list");
  const template = document.querySelector("#task-template");
  const filterButtons = document.querySelectorAll("[data-filter]");

  const emptyState = document.querySelector("#empty-state");
  const emptyTitle = document.querySelector("#empty-title");
  const emptyDescription = document.querySelector("#empty-description");

  const status = document.querySelector("#app-status");
  const storageNotice = document.querySelector("#storage-notice");

  const toast = document.querySelector("#undo-toast");
  const undoButton = document.querySelector("#undo-button");
  const dismissButton = document.querySelector("#dismiss-undo");

  let tasks = [];
  let currentFilter = "all";
  let deletedTask = null;
  let storageWritable = true;
  let announcementTimer;

  /* ---------- FEEDBACK ---------- */

  function announce(message) {
    clearTimeout(announcementTimer);
    status.textContent = "";

    announcementTimer = setTimeout(() => {
      status.textContent = message;
    }, 60);
  }

  function showStorageNotice(message) {
    storageNotice.textContent = message;
    storageNotice.hidden = false;
  }

  /* ---------- LOAD AND SAVE ---------- */

  function isValidTask(task) {
    return (
      task !== null &&
      typeof task === "object" &&
      typeof task.id === "string" &&
      task.id.length > 0 &&
      typeof task.title === "string" &&
      task.title.trim().length > 0 &&
      task.title.length <= 160 &&
      typeof task.completed === "boolean" &&
      Object.hasOwn(categories, task.category) &&
      Object.hasOwn(priorities, task.priority)
    );
  }

  function loadTasks() {
    let saved;

    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      storageWritable = false;

      showStorageNotice(
        "Browser storage is unavailable. You can use DAYFORM, " +
        "but tasks will be lost when you reload or close this page."
      );

      return;
    }

    if (saved === null) return;

    try {
      const parsed = JSON.parse(saved);

      if (
        !Array.isArray(parsed) ||
        !parsed.every(isValidTask) ||
        new Set(parsed.map((task) => task.id)).size !== parsed.length
      ) {
        throw new Error("Invalid task data");
      }

      tasks = parsed;
    } catch {
      // Preserve unreadable saved data instead of overwriting it.
      storageWritable = false;

      showStorageNotice(
        "Saved task data could not be read and has been left unchanged. " +
        "Tasks added in this session will not be saved. " +
        "Please report this issue before clearing browser storage."
      );
    }
  }

  function saveTasks() {
    if (!storageWritable) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      storageNotice.hidden = true;
    } catch {
      showStorageNotice(
        "Your latest changes could not be saved. Keep this page open " +
        "and copy any important tasks before leaving."
      );
    }
  }

  function createId() {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }

    let id;

    do {
      id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    } while (tasks.some((task) => task.id === id));

    return id;
  }

  /* ---------- FILTERING ---------- */

  function getVisibleTasks() {
    return tasks.filter((task) => {
      if (currentFilter === "active") return !task.completed;
      if (currentFilter === "completed") return task.completed;
      return true;
    });
  }

  function updateFilters() {
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === currentFilter;

      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  /* ---------- PROGRESS ---------- */

  function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    document.querySelector("#total-count").textContent = total;
    document.querySelector("#active-count").textContent = active;
    document.querySelector("#completed-count").textContent = completed;

    document.querySelector("#filter-all-count").textContent = total;
    document.querySelector("#filter-active-count").textContent = active;
    document.querySelector("#filter-completed-count").textContent = completed;

    document.querySelector("#progress-percent").textContent =
      `${percentage}%`;

    document.querySelector("#progress-ring").style.setProperty(
      "--progress",
      `${percentage}%`
    );

    const progress = document.querySelector("#completion-progress");
    progress.value = percentage;
    progress.textContent = `${percentage}%`;

    const caption = document.querySelector("#progress-caption");

    if (total === 0) {
      caption.textContent = "Add your first task to begin.";
    } else if (completed === total) {
      caption.textContent = "Everything is complete. Take a little pause.";
    } else {
      caption.textContent =
        `${completed} of ${total} tasks complete. Small steps count.`;
    }
  }

  /* ---------- EMPTY STATES ---------- */

  function updateEmptyState(visibleCount) {
    emptyState.hidden = visibleCount > 0;

    document.querySelector("#visible-count").textContent =
      `${visibleCount} ${visibleCount === 1 ? "task" : "tasks"}`;

    if (tasks.length === 0) {
      emptyTitle.textContent = "A little space for a fresh start.";
      emptyDescription.textContent =
        "Add your first task above. Your next step can be a small one.";
    } else if (currentFilter === "active") {
      emptyTitle.textContent = "All caught up.";
      emptyDescription.textContent =
        "You have no active tasks. Enjoy a pause or add your next step.";
    } else if (currentFilter === "completed") {
      emptyTitle.textContent = "Your progress will appear here.";
      emptyDescription.textContent =
        "Complete a task and you’ll find it in this view.";
    }
  }

  /* ---------- RENDER TASKS ---------- */

  function render(newTaskId = null) {
    const visibleTasks = getVisibleTasks();
    const fragment = document.createDocumentFragment();

    visibleTasks.forEach((task) => {
      const item = template.content.firstElementChild.cloneNode(true);

      item.dataset.id = task.id;
      item.classList.toggle("is-completed", task.completed);
      item.classList.toggle("is-new", task.id === newTaskId);

      // Render user input as text, never as HTML.
      item.querySelector(".task-title").textContent = task.title;

      const checkbox = item.querySelector(".task-checkbox");
      checkbox.checked = task.completed;

      item.querySelector(".task-check-label").textContent =
        task.completed
          ? `Mark "${task.title}" as active`
          : `Mark "${task.title}" as complete`;

      const category = item.querySelector(".category-badge");
      category.textContent = categories[task.category];
      category.dataset.category = task.category;

      const priority = item.querySelector(".priority-badge");
      priority.textContent = priorities[task.priority];
      priority.dataset.priority = task.priority;

      item.querySelector(".delete-task").setAttribute(
        "aria-label",
        `Delete "${task.title}"`
      );

      fragment.append(item);
    });

    taskList.replaceChildren(fragment);

    updateFilters();
    updateProgress();
    updateEmptyState(visibleTasks.length);
  }

  /* ---------- KEYBOARD FOCUS ---------- */

  function focusTask(id, selector = ".task-checkbox") {
    const item = Array.from(taskList.children).find(
      (element) => element.dataset.id === id
    );

    if (!item) return false;

    item.querySelector(selector)?.focus({ preventScroll: true });
    return true;
  }

  function focusNearbyTask(index, selector = ".task-checkbox") {
    const items = Array.from(taskList.children);
    const item = items[Math.min(index, items.length - 1)];

    if (item) {
      item.querySelector(selector)?.focus({ preventScroll: true });
    } else {
      document.querySelector(
        `[data-filter="${currentFilter}"]`
      )?.focus({ preventScroll: true });
    }
  }

  /* ---------- ADD TASK ---------- */

  titleInput.addEventListener("input", () => {
    titleInput.setCustomValidity("");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();

    titleInput.setCustomValidity(
      title ? "" : "Please write a task, not just spaces."
    );

    if (!form.reportValidity()) return;

    const task = {
      id: createId(),
      title,
      category: categoryInput.value,
      priority: priorityInput.value,
      completed: false,
    };

    tasks.unshift(task);

    // Make the newly added active task visible.
    if (currentFilter === "completed") {
      currentFilter = "active";
    }

    saveTasks();
    render(task.id);

    titleInput.value = "";
    titleInput.focus();

    announce(`Added: ${task.title}`);
  });

  /* ---------- COMPLETE OR REOPEN TASK ---------- */

  taskList.addEventListener("change", (event) => {
    if (!event.target.matches(".task-checkbox")) return;

    const item = event.target.closest(".task-item");
    const task = tasks.find((entry) => entry.id === item.dataset.id);

    if (!task) return;

    const visibleIndex = Array.from(taskList.children).indexOf(item);
    const hadFocus = document.activeElement === event.target;

    task.completed = event.target.checked;

    saveTasks();
    render();

    if (hadFocus && !focusTask(task.id)) {
      focusNearbyTask(visibleIndex);
    }

    announce(
      task.completed
        ? `Completed: ${task.title}`
        : `Marked active: ${task.title}`
    );
  });

  /* ---------- DELETE TASK ---------- */

  taskList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-task");
    if (!button) return;

    const item = button.closest(".task-item");
    const index = tasks.findIndex(
      (task) => task.id === item.dataset.id
    );

    if (index < 0) return;

    const visibleIndex = Array.from(taskList.children).indexOf(item);
    const hadFocus = item.contains(document.activeElement);

    deletedTask = {
      task: tasks[index],
      index,
    };

    tasks.splice(index, 1);

    saveTasks();
    render();

    if (hadFocus) {
      focusNearbyTask(visibleIndex, ".delete-task");
    }

    document.querySelector("#undo-message").textContent =
      "Task deleted. Undo the last deletion.";

    toast.hidden = false;

    announce(
      `Deleted: ${deletedTask.task.title}. Undo is available.`
    );
  });

  /* ---------- UNDO LAST DELETION ---------- */

  undoButton.addEventListener("click", () => {
    if (!deletedTask) return;

    const { task, index } = deletedTask;

    tasks.splice(Math.min(index, tasks.length), 0, task);

    // Ensure the restored task is visible.
    if (
      (currentFilter === "active" && task.completed) ||
      (currentFilter === "completed" && !task.completed)
    ) {
      currentFilter = "all";
    }

    deletedTask = null;

    saveTasks();
    render(task.id);

    // Move focus out of the toast before hiding it.
    focusTask(task.id);
    toast.hidden = true;

    announce(`Restored: ${task.title}`);
  });

  dismissButton.addEventListener("click", () => {
    deletedTask = null;
    titleInput.focus({ preventScroll: true });
    toast.hidden = true;
    announce("Undo dismissed.");
  });

  /* ---------- FILTER BUTTONS ---------- */

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      render();

      announce(
        `${button.dataset.filter} view. ` +
        `${getVisibleTasks().length} tasks shown.`
      );
    });
  });

  /* ---------- DATE ---------- */

  const dateElement = document.querySelector("#current-date");
  const today = new Date();

  dateElement.dateTime = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  dateElement.textContent = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(today);

  /* ---------- START APPLICATION ---------- */

  loadTasks();
  render();

  form.querySelectorAll("input, select, button").forEach((control) => {
    control.disabled = false;
  });

  filterButtons.forEach((button) => {
    button.disabled = false;
  });
})();