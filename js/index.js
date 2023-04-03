function createApp(rootComponent) {
  return {
    mount(selector) {
      const container = document.querySelector(selector);
      let issMounted = false;
      let oldVnode = null;
      watchEffect(() => {
        if(!issMounted){
          oldVnode = rootComponent.render()
          mount(oldVnode, container);
          issMounted = true;
        } else {
          const newVnode = rootComponent.render()
          patch(oldVnode, newVnode);
          oldVnode = newVnode;
        }
      })
    }
  }
}