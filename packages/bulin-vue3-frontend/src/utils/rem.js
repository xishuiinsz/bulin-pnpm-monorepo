const rem = {
  install(app) {
    const docEl = document.documentElement;
    const defaultFontSize = 16;
    const designSize = 1920;
    // adjust body font size
    // 设置 em 默认字体所对应的大小
    function setBodyFontSize() {
      const { clientWidth } = docEl;
      const rate = clientWidth / designSize;
      docEl.style.setProperty('--scale-rate', rate);
      const fontSize = `${defaultFontSize * rate}px`;
      Object.assign(docEl.style, { fontSize });
    }
    setBodyFontSize();
    window.addEventListener('resize', setBodyFontSize);
  },
};

export default rem;
