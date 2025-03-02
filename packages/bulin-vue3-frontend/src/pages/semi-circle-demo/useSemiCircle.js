import { getCurrentInstance, onMounted, watch } from 'vue';

function useSemiCircle(value) {
  let ctx;
  const instance = getCurrentInstance();
  const lineWidth = 10;
  const initCanvas = () => {
    const canvas = instance.proxy.$el;
    if (!ctx) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
      const radius = height - lineWidth;
      const xCircle = height;
      const yCircle = height - lineWidth / 2;
      ctx.strokeStyle = '#dedede';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.arc(xCircle, yCircle, radius, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    else {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const radius = ctx.canvas.height - lineWidth;
      const xCircle = ctx.canvas.height;
      const yCircle = ctx.canvas.height - lineWidth / 2;
      ctx.beginPath();
      ctx.strokeStyle = '#dedede';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.arc(xCircle, yCircle, radius, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  };
  const drawProggressRing = (endAngle) => {
    if (endAngle <= Math.PI) {
      return;
    }
    const height = ctx.canvas.height;

    const radius = height - lineWidth;
    const xCircle = height;
    const yCircle = height - lineWidth / 2;
    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.arc(xCircle, yCircle, radius, Math.PI, endAngle);
    ctx.stroke();
  };

  function drawEndPoint(angle) {
    if (angle <= Math.PI) {
      return;
    }
    const height = ctx.canvas.height;

    const radius = height - lineWidth;
    const xCircle = height;
    const yCircle = height - lineWidth / 2;

    const x = xCircle + radius * Math.cos(angle);
    const y = yCircle + radius * Math.sin(angle);

    ctx.beginPath();

    // 圆点半径为线宽的一半
    ctx.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }
  const watchHandler = (num) => {
    initCanvas();
    const endAngle = Math.PI + Math.PI * Math.min((num / 100), 1);
    drawProggressRing(endAngle);
    drawEndPoint(endAngle);
  };
  const watchConfig = { immediate: true };
  const init = () => {
    watch(value, watchHandler, watchConfig);
  };

  onMounted(init);
}

export default useSemiCircle;
