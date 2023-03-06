const colors = ["#ebedf0", "#74c476", "#41ab5d", "#238b45", "#005a32"]

const rowColors = {}
const colColors = {}
const colorScaleCount = colors.length
const getColor = (col, row) => {
  if (!rowColors[row]) rowColors[row] = Math.random()
  if (!colColors[col]) colColors[col] = Math.random()

  const scaled = Math.max(rowColors[row], colColors[col])
  let index = 0
  if (scaled < 0.8) index = 0
  else if (scaled < 0.9) index = 1
  else if (scaled < 0.95) index = 2
  else if (scaled < 0.99) index = 3
  else index = 4

  if (Math.random() < 0.9) index--
  if (Math.random() < 0.9) index--
  if (Math.random() < 0.9) index--

  return colors[Math.max(index, 0)]
}

const draw = () => {
  const holder = document.getElementById("csvCanvasHolder")
  const width = 700
  const height = 500
  holder.innerHTML = `<div id="canvasHeader">Scanned 141M lines of data. 102K rows 10.1K columns.</div><canvas id="csvCanvas" width="${width}" height="${height}"></canvas>`
  const canvas = document.getElementById("csvCanvas")
  const ctx = canvas.getContext("2d")
  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      ctx.fillStyle = getColor(col, row)
      ctx.fillRect(col, row, 1, 1)
    }
  }
}
draw()
