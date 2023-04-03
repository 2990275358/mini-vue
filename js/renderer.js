/**
 * 生成虚拟dom（js对象）
 * @param {String} tag 节点类型
 * @param {Object} props 虚拟节点的属性
 * @param {String,Array} children 子节点
 * @returns 
 */
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}
/**
 * 挂载虚拟节点
 * @param {Object} vnode 虚拟节点
 * @param {Object} container 真实的dom节点
 */
const mount = (vnode, container) => {
  const { tag, props, children } = vnode;
  // 1.创建真实元素，并且在vnode上保留
  const el = vnode.el = document.createElement(tag);
  // 2.判断props，设置att
  if(props) {
    for(let key in props) {
      const value = props[key];
      if(key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLocaleLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  // 3.判断children
  if(children) {
    if(typeof children === "string") {
      el.textContent = children
    } else {
      children.forEach(element => {
        mount(element, el)
      });
    }
  }
  // 4.将虚拟dom挂载在真实dom上
  container.appendChild(el);
}

const a = document.createElement("div")
const patch = (n1, n2) => {
  const el = n2.el = n1.el;
  // 1、对比tag类型是否一致
  if(n1.tag !== n2.tag) {
    const preEl = el.parentElement;
    preEl.removeChild(n1.el);
    mount(n2, preEl);
    return;
  }

  // 2、处理props
  const oldProps = n1.props || {};
  const newProps = n2.props || {};
  // 2.1 获取所有新的props，与旧的不一致的就添加上
  for(let key in newProps) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];
    if(oldValue !== newValue) {
      if(key.startsWith("on")) {
        el.removeEventListener(key.slice(2).toLocaleLowerCase(), oldValue);
        el.addEventListener(key.slice(2).toLocaleLowerCase(), newValue);
      } else {
        el.setAttribute(key, newValue);
      }
    }
  }
  // 2.2删除旧的没有的props
  for(let key in oldProps) {
    if(!(key in newProps)) {
      if(key.startsWith("on")) {
        el.removeEventListener(key.slice(2).toLocaleLowerCase(), oldProps[key])
      } else {
        el.removeAttribute(key)
      }
    }
  }

  // 3、处理children
  const oldChildren = n1.children || [];
  const newChildren = n2.children || [];
  // 3.1 新的children是字符串时直接替换
  if(typeof newChildren === "string") {
    if(typeof oldChildren === "string") {
      oldChildren !== newChildren ? el.textContent = newChildren : '';
    }else {
      el.innerHTML = newChildren
    }
  }else {
    // 3.2 新的children是数组
    if(typeof oldChildren === "string") {
      el.innerHTML = "";
      newChildren.forEach(item => mount(item, el));
    }else {
      const commonLength = Math.min(oldChildren.length, newChildren.length);
      // 3.2.2 替换数组长度一致的部分的内容
      for(let i = 0; i < commonLength; i++) {
        patch(oldChildren[i], newChildren[i]);
      }

      // 3.2.3 oldChildren > newChildren
      if(oldChildren.length > newChildren.length) {
        oldChildren.slice(commonLength).forEach(item => {
          el.removeChild(item.el);
        })
      }

      // 3.2.4 oldChildren < newChildren
      if(newChildren.length > oldChildren.length) {
        newChildren.slice(commonLength).forEach(item => {
          mount(item, el);
        })
      }
    }
  }
}