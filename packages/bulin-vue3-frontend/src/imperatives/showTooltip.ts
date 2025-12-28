import { ElTooltip } from 'element-plus';
import { h, render, type ExtractPublicPropTypes } from 'vue';
import type { ElTooltipProps } from 'element-plus/es/components/tooltip';

let tooltipWrap: HTMLDivElement | null = null;
const delayDefault = 300;
let timer: ReturnType<typeof setTimeout> | null = null;

type Options = {
  getVisibility?: () => boolean;
  closeOnClick?: boolean;
  delay?: number;
};

type TooltipProps = ExtractPublicPropTypes<ElTooltipProps> & Options;

// 命令式(编程式)调用ElTooltip组件
const showTooltip = (params: HTMLElement | MouseEvent, options: TooltipProps = {}) => {
  const targetEl = params instanceof MouseEvent ? (params.target as HTMLElement) : params;
  const { getVisibility, closeOnClick = true, delay = delayDefault, ...restOptions } = options;
  let visibility = false;
  if (typeof getVisibility === 'function') {
    visibility = getVisibility();
  } else {
    visibility = targetEl.scrollWidth > targetEl.offsetWidth || targetEl.scrollHeight > targetEl.offsetHeight;
  }
  if (visibility) {
    if (!tooltipWrap) {
      tooltipWrap = document.createElement('div');
      document.body.appendChild(tooltipWrap);
    }
    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const destroy = () => {
      render(null, tooltipWrap!);
    };

    const delayDestroy = () => {
      timer = setTimeout(destroy, delay);
    };
    clearTimer();
    tooltipWrap.addEventListener('mouseenter', () => {
      clearTimer();
      tooltipWrap?.addEventListener('mouseleave', delayDestroy, { once: true });
    });
    const content = targetEl instanceof HTMLInputElement ? targetEl.value : targetEl.innerText;
    const tooltipProps = {
      placement: 'top',
      content,
      enterable: true,
      visible: true,
      virtualRef: targetEl,
      virtualTriggering: true,
      appendTo: tooltipWrap,
      ...restOptions
    };
    const vnode = h(ElTooltip, tooltipProps);
    render(vnode, tooltipWrap);
    targetEl.addEventListener('mouseleave', tooltipProps.enterable ? delayDestroy : destroy, { once: true });
    if (closeOnClick) {
      targetEl.addEventListener('click', destroy);
    }
  }
};

export default showTooltip;
