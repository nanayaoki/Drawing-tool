const canvas = document.querySelector("canvas");
const fillColor = document.querySelector("#fillColor");
const sizeSlider = document.querySelector("#sizeSlider");
const colorBtns = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#colorPicker");
const ctx = canvas.getContext("2d");

const clearCanvasBtn = document.getElementById("clearCanvas");
const saveImageBtn = document.getElementById("saveImg");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");

const toolBtns = document.querySelectorAll(".tool[id]:not(#undo):not(#redo):not(#clearCanvas):not(#saveImg)");

let prevMouseX, prevMouseY, snapshot, isDrawing = false;
let selectedTool = "pencil", brushWidth = 5, selectedColor = "#000";
let history = [], historyStep = -1;

const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
};

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});

const drawRect = (e) => {
  const width = prevMouseX - e.offsetX;
  const height = prevMouseY - e.offsetY;
  if (!fillColor.checked) {
    ctx.strokeRect(e.offsetX, e.offsetY, width, height);
  } else {
    ctx.fillRect(e.offsetX, e.offsetY, width, height);
  }
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawSquare = (e) => {
  const sideLength = Math.abs(prevMouseX - e.offsetX);
  ctx.beginPath();
  ctx.rect(e.offsetX, e.offsetY, sideLength, sideLength);
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawHexagon = (e) => {
  const sideLength = Math.abs(prevMouseX - e.offsetX);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = ((2 * Math.PI) / 6) * i;
    const x = e.offsetX + sideLength * Math.cos(angle);
    const y = e.offsetY + sideLength * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawPentagon = (e) => {
  const sideLength = Math.abs(prevMouseX - e.offsetX);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = ((2 * Math.PI) / 5) * i - Math.PI / 2;
    const x = e.offsetX + sideLength * Math.cos(angle);
    const y = e.offsetY + sideLength * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawDiamond = (e) => {
  const dx = Math.abs(prevMouseX - e.offsetX);
  const dy = Math.abs(prevMouseY - e.offsetY);
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(prevMouseX + dx, prevMouseY + dy / 2);
  ctx.lineTo(prevMouseX, prevMouseY + dy);
  ctx.lineTo(prevMouseX - dx, prevMouseY + dy / 2);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawLine = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const drawing = (e) => {
  if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;

  if (selectedTool === "eraser") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = brushWidth * 3;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "pencil") {
    ctx.shadowBlur = 0;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "brush") {
    ctx.shadowColor = selectedColor;
    ctx.shadowBlur = 15;
    ctx.lineWidth = brushWidth * 2;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (selectedTool === "rectangle") {
    drawRect(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else if (selectedTool === "triangle") {
    drawTriangle(e);
  } else if (selectedTool === "square") {
    drawSquare(e);
  } else if (selectedTool === "hexagon") {
    drawHexagon(e);
  } else if (selectedTool === "pentagon") {
    drawPentagon(e);
  } else if (selectedTool === "line") {
    drawLine(e);
  } else if (selectedTool === "diamond") {
    drawDiamond(e);
  }
};

toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".option.active")?.classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});

sizeSlider.addEventListener("input", () => (brushWidth = sizeSlider.value));

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".colors .option.selected")?.classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
  });
});

colorPicker.addEventListener("input", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
  selectedColor = colorPicker.value;
});

clearCanvasBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground();
  saveState();
});

saveImageBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});

undoButton.addEventListener("click", () => {
  if (historyStep > 0) {
    historyStep--;
    const img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  } else if (historyStep === 0) {
    historyStep = -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground(); 
  }
});

redoButton.addEventListener("click", () => {
  if (historyStep < history.length - 1) {
    historyStep++;
    const img = new Image();
    img.src = history[historyStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  saveState();
});

function saveState() {
  history = history.slice(0, historyStep + 1);
  history.push(canvas.toDataURL());
  historyStep++;
}