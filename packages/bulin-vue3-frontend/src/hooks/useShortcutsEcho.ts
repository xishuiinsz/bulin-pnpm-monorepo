import { toRaw } from 'vue';

const basePopperClass = 'date-picker-with-shortcuts-need-echo';
const selector = 'selected-shortcut';
const shortcutSelector = '.el-picker-panel__shortcut';
const sheet = document.createElement('style');
sheet.innerHTML = `
  .${basePopperClass} .${selector} {
    background-color: #409eff;
    color: #fff;
  }
`;
document.head.appendChild(sheet);

function useShortcutsEcho({ shortcuts = [], formData = {}, key = 'date' }) {
  const popperClass = `${basePopperClass} date-picker-popper-${Date.now()}`;

  const getDatePopper = () => {
    return document.querySelector(`.${popperClass.split(' ').join('.')}`);
  };

  const clearShortcutSelection = () => {
    const datePopper = getDatePopper();
    if (datePopper) {
      const shortcutElements = datePopper.querySelectorAll(shortcutSelector);
      shortcutElements.forEach((el) => {
        el.classList.remove(selector);
      });
    }
  };
  const ensureShortcutSelection = (text: string) => {
    if (!text?.trim()) {
      return;
    }
    const datePopper = getDatePopper();
    if (datePopper) {
      const shortcutElements = datePopper.querySelectorAll(shortcutSelector);
      for (let index = 0; index < shortcutElements.length; index++) {
        const element = shortcutElements[index];
        if (element.textContent === text) {
          element.classList.add(selector);
          break;
        }
      }
    }
  };
  const visibleChange = (visible: boolean) => {
    if (visible) {
      return;
    }
    clearShortcutSelection();
    const selectedDates = toRaw(formData[key]);
    if (selectedDates?.length === 2) {
      const [startTime, endTime] = selectedDates;
      const shortcut = shortcuts.find((s) => {
        const [start, end] = s.value().map((t) => {
          return t.toLocaleDateString('zh', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).replaceAll('/', '-');
        });
        return startTime === start && endTime === end;
      });
      if (shortcut) {
        const { text } = shortcut;
        ensureShortcutSelection(text);
      }
    }
  };

  return { visibleChange, popperClass };
}
export default useShortcutsEcho;
