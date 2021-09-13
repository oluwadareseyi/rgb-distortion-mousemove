import Canvas from "./app/Canvas";

const canvas = new Canvas();

window.addEventListener("resize", () => {
  canvas.onResize();
});

const render = () => {
  // update canvas
  canvas.update(scroll);

  // Call render again on the next frame
  window.requestAnimationFrame(render);
};

render();
