class Dep {
  constructor() {
    this.subscribe = new Set();
  }

  // 收集依赖
  depend() {
    if(activeEffect) {
      this.subscribe.add(activeEffect)
    }
  }

  notify() {
    this.subscribe.forEach(effcet => effcet());
  }
}

// 获取dep
const targetMap = new WeakMap();
function getDep(target, key) {
  // 1、根据target取出对应的Map对象
  let depsMap = targetMap.get(target);
  if(!depsMap) {
    depsMap = new Map()
    targetMap.set(target,depsMap);
  }
  let dep = depsMap.get(key);
  if(!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}
// 数据劫持
function reactiveVue2(raw) {
  Object.keys(raw).forEach(key => {
    const dep = getDep(raw, key);
    let value = raw[key];
    Object.defineProperty(raw, key, {
      get() {
        dep.depend();
        return value;
      },
      set(newValue) {
        if(value !== newValue) {
          value = newValue;
          dep.notify();
        }
      }
    })
  })
  return raw;
}
function reactiveVue3(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key);
      dep.depend();
      return target[key];
    },
    set(target, key, newValue) {
      if(target[key] !== newValue) {
        target[key] = newValue;
        const dep = getDep(target, key);
        dep.notify();
      }
    }
  });
}
// 收集依赖
let activeEffect = null;
function watchEffect(effect) {
  activeEffect = effect;
  effect();
  activeEffect = null;
}
