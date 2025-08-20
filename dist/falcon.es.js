const y = [], C = () => y[y.length - 1] || null;
function g(n, e) {
  let o = n;
  const s = /* @__PURE__ */ new Set(), c = (e == null ? void 0 : e.equals) === !1 ? () => !1 : Object.is, t = `Signal[${n}]`;
  return [() => {
    const r = C();
    if (r) {
      const u = r.name || "effect" + Math.random().toString(36).substring(7);
      console.log(
        `%c${t}: Adding observer: ${u}`,
        "color: teal;"
      ), s.add(r), r.dependencies.add(s);
    }
    return o;
  }, (r) => {
    if (c(o, r))
      console.log(
        `%c${t}: Skipping update from ${o} to ${r} due to equals check.`,
        "color: gray;"
      );
    else {
      const u = o;
      o = r, console.log(
        `%c${t}: Value set from ${u} to ${o}. Notifying ${s.size} observers.`,
        "color: red; font-weight: bold;"
      ), new Set(s).forEach((a) => {
        const f = a.name || "effect" + Math.random().toString(36).substring(7);
        console.log(
          `%c${t}: Notifying observer: ${f}`,
          "color: red;"
        ), typeof a == "function" ? a() : (console.warn(
          `${t}: Attempted to notify non-function observer:`,
          a
        ), s.delete(a));
      });
    }
  }];
}
function k(n) {
  console.log("createMemo: Initializing memo for function:", n.toString());
  let e, o = !1;
  const [s, c] = g(void 0, { equals: !1 });
  return h(() => {
    console.log("%ccreateMemo: Internal effect (B) START", "color: blue;");
    const t = n();
    console.log("%c  Calculated newValue:", "color: blue;", t), !o || !Object.is(e, t) ? (console.log(
      "%c  Value changed! Old:",
      "color: blue;",
      e,
      "New:",
      t
    ), e = t, o = !0, console.log("%c  Calling triggerMemo()", "color: blue;"), c()) : console.log("%c  Value NOT changed.", "color: blue;"), console.log("%ccreateMemo: Internal effect (B) END", "color: blue;");
  }), () => {
    console.log("%ccreateMemo: Getter (C) called.", "color: green;");
    const t = C(), l = t ? t.name || "effect" + Math.random().toString(36).substring(7) : "none";
    return console.log("%c  Current observer:", "color: green;", l), s(), console.log("%c  Returning memoizedValue:", "color: green;", e), e;
  };
}
function M(n) {
  for (const e of n.cleanups)
    try {
      e();
    } catch (o) {
      console.error("Error during onCleanup function:", o);
    }
  n.cleanups.length = 0;
  for (const e of n.dependencies)
    e.delete(n);
  n.dependencies.clear();
}
function h(n) {
  const e = () => {
    M(e), y.push(e);
    try {
      console.log("Effect Execute: Running user callback"), n();
    } catch (o) {
      console.error("Error during effect execution:", o);
    } finally {
      y.pop(), console.log("Effect Execute: Finished, removed from stack.");
    }
  };
  e.dependencies = /* @__PURE__ */ new Set(), e.cleanups = [], console.log("createEffect: Scheduling initial execution with queueMicrotask"), queueMicrotask(e);
}
function T(n) {
  const e = C();
  e ? e.cleanups.push(n) : console.warn(
    "onCleanup was called outside of a reactive effect scope and will be ignored."
  );
}
function N(n, e) {
  if (Array.isArray(e))
    e.forEach((o) => N(n, o));
  else if (e instanceof Node)
    n.appendChild(e);
  else if (typeof e == "string" || typeof e == "number")
    n.appendChild(document.createTextNode(e));
  else if (typeof e == "function") {
    const o = document.createTextNode("");
    h(() => {
      o.textContent = e();
    }), n.appendChild(o);
  } else e == null || typeof e == "boolean" || console.warn("An unknown child type was passed to appendChild:", e);
}
function x(n, e, ...o) {
  if (typeof n == "function")
    return n({ ...e, children: o });
  const s = document.createElement(n);
  if (e)
    for (const [c, t] of Object.entries(e))
      c.startsWith("on") && typeof t == "function" ? s.addEventListener(c.substring(2).toLowerCase(), t) : typeof t == "function" && !c.startsWith("on") ? h(() => {
        const l = t();
        typeof l == "boolean" && ["checked", "disabled", "selected"].includes(c) ? l ? s.setAttribute(c, "") : s.removeAttribute(c) : s.setAttribute(c, l);
      }) : c !== "children" && s.setAttribute(c, t);
  return N(s, o), s;
}
function V(n, e) {
  e.innerHTML = "";
  const o = n();
  N(e, o);
}
function S(n) {
  return n instanceof Node ? n : n == null || typeof n == "boolean" ? document.createComment("falcon-empty-content") : document.createTextNode(String(n));
}
function D(n) {
  var l;
  const e = (l = n.children) == null ? void 0 : l[0];
  if (typeof e != "function")
    return console.error("<For> component requires a function as its only child."), S(null);
  const o = document.createComment("falcon-for-start"), s = document.createComment("falcon-for-end");
  let c = /* @__PURE__ */ new Map();
  h(() => {
    const d = n.each(), r = o.parentNode;
    if (!Array.isArray(d) || !r) return;
    const u = /* @__PURE__ */ new Map(), m = [];
    for (let f = 0; f < d.length; f++) {
      const i = d[f], p = i.id, b = c.get(p);
      if (b)
        m.push(b), u.set(p, b), c.delete(p);
      else {
        const w = S(e(i, f));
        w._falcon_item_key_ = p, m.push(w), u.set(p, w);
      }
    }
    let a = o.nextSibling;
    for (const f of m)
      a === f ? a = a.nextSibling : r.insertBefore(f, a);
    for (; a !== s; ) {
      const f = a.nextSibling, i = a._falcon_item_key_;
      c.has(i) && r.removeChild(a), a = f;
    }
    c = u;
  });
  const t = document.createDocumentFragment();
  return t.appendChild(o), t.appendChild(s), t;
}
function E(n) {
  const { when: e, fallback: o, children: s } = n, c = document.createComment("falcon-show");
  let t = [];
  const l = k(() => !!e());
  return h(() => {
    const d = l(), r = c.parentNode;
    if (!r) return;
    t.length > 0 && t.forEach((i) => {
      i.parentNode === r && r.removeChild(i);
    }), t = [];
    const u = d ? s : o, m = document.createDocumentFragment();
    function a(i) {
      Array.isArray(i) ? i.forEach(a) : typeof i == "function" ? a(i()) : i instanceof Node ? m.appendChild(i) : i != null && typeof i != "boolean" && m.appendChild(document.createTextNode(String(i)));
    }
    a(u);
    const f = Array.from(m.childNodes);
    r.insertBefore(m, c.nextSibling), t = f;
  }), c;
}
function _(n) {
  const [e, o] = g(void 0), [s, c] = g(!1), [t, l] = g(null);
  h(async () => {
    c(!0), l(null);
    try {
      const u = await n();
      o(u);
    } catch (u) {
      console.error("[createResource] Fetching failed:", u), l(u);
    } finally {
      c(!1);
    }
  });
  const r = () => e();
  return r.loading = () => s(), r.error = () => t(), r;
}
const [A, v] = g(window.location.pathname);
window.addEventListener("popstate", () => {
  v(window.location.pathname);
});
function $(n) {
  window.history.pushState({}, "", n), v(n);
}
function q(n) {
  const { path: e, children: o } = n, s = k(() => A() === e);
  return E({
    when: s,
    children: o
  });
}
function F(n) {
  const { to: e, children: o } = n;
  return x("a", { href: e, onclick: (c) => {
    c.preventDefault(), $(e);
  } }, o);
}
function L(n) {
  const e = {}, o = {
    get(t, l) {
      if (l in t)
        return t[l][0]();
      console.warn(`[Store] Property "${l}" does not exist on the store.`);
    },
    set() {
      return console.warn(
        "[Store] Direct mutation is not allowed. Use the setter function instead."
      ), !1;
    }
  };
  for (const t in n)
    e[t] = g(n[t]);
  return [new Proxy(e, o), (t) => {
    const l = {};
    for (const r in e)
      l[r] = e[r][0]();
    const d = typeof t == "function" ? t(l) : t;
    for (const r in d)
      r in e ? e[r][1](d[r]) : console.warn(
        `[Store] Cannot set property "${r}" that was not in the initial state.`
      );
  }];
}
export {
  D as For,
  F as Link,
  q as Route,
  E as Show,
  h as createEffect,
  x as createFalconElement,
  k as createMemo,
  _ as createResource,
  g as createSignal,
  L as createStore,
  $ as navigate,
  T as onCleanup,
  V as render
};
//# sourceMappingURL=falcon.es.js.map
