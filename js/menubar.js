import { el } from "./utils.js";

export function mountMenubar(root, menus) {
  let openIndex = -1;

  const entries = menus.map((menu, index) => {
    const title = el(
      "button",
      { type: "button", class: "menu-title", "aria-haspopup": "menu", "aria-expanded": "false" },
      menu.label,
    );
    const list = el("div", {
      class: "menu-list",
      role: "menu",
      "aria-label": menu.label,
      hidden: true,
    });
    title.addEventListener("click", () => (openIndex === index ? close() : open(index)));
    title.addEventListener(
      "pointerenter",
      () => openIndex !== -1 && openIndex !== index && open(index),
    );
    return { menu, title, list, node: el("div", { class: "menu" }, title, list) };
  });

  // Items are rebuilt on each open, so enabled and checked show the current state.
  function renderItem(item) {
    if (item.divider) return el("hr", { class: "menu-divider" });
    const enabled = item.enabled ? item.enabled() : true;
    const checked = item.checked ? item.checked() : null;
    return el(
      "button",
      {
        type: "button",
        class: "menu-item",
        role: checked === null ? "menuitem" : "menuitemcheckbox",
        "aria-checked": checked === null ? null : String(checked),
        disabled: !enabled,
        onclick: () => {
          close();
          item.run();
        },
      },
      el("span", { class: "menu-check", "aria-hidden": "true" }, checked ? "x" : ""),
      el("span", { class: "menu-label" }, item.label),
      el("span", { class: "menu-shortcut" }, item.shortcut ?? ""),
    );
  }

  function open(index) {
    close();
    openIndex = index;
    const { menu, title, list } = entries[index];
    list.replaceChildren(...menu.items.map(renderItem));
    list.hidden = false;
    title.setAttribute("aria-expanded", "true");
  }

  function close() {
    if (openIndex === -1) return;
    const { title, list } = entries[openIndex];
    list.hidden = true;
    title.setAttribute("aria-expanded", "false");
    openIndex = -1;
  }

  function focusItem(step) {
    const items = [...entries[openIndex].list.querySelectorAll(".menu-item:not(:disabled)")];
    const current = items.indexOf(document.activeElement);
    const start = current === -1 && step < 0 ? 0 : current;
    items[(start + step + items.length) % items.length]?.focus();
  }

  function switchMenu(step) {
    const next = (openIndex + step + entries.length) % entries.length;
    open(next);
    entries[next].title.focus();
  }

  // On document, so Escape closes a menu that was opened by mouse or touch.
  document.addEventListener("keydown", (event) => {
    if (openIndex === -1) return;
    const handlers = {
      Escape: () => {
        const { title } = entries[openIndex];
        close();
        title.focus();
      },
      ArrowDown: () => focusItem(1),
      ArrowUp: () => focusItem(-1),
      ArrowRight: () => switchMenu(1),
      ArrowLeft: () => switchMenu(-1),
    };
    if (!handlers[event.key]) return;
    event.preventDefault();
    handlers[event.key]();
  });

  document.addEventListener("pointerdown", (event) => {
    if (!root.contains(event.target)) close();
  });

  root.append(...entries.map((entry) => entry.node));
}
