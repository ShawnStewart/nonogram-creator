const boxWidth = 20;
let width = document.getElementById("canvasWidth").value;
let height = document.getElementById("canvasHeight").value;
let colorOne = document.getElementById("colorOne").value;
let colorTwo = document.getElementById("colorTwo").value;
let draggingStatus = -1;
let grid = [];
let history = [];
let rows = [];
let columns = [];
let maxColorsX = 0;
let maxColorsY = 0;
let puzzleGrid = [];

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

const puzzle = document.getElementById("puzzle");
const pctx = puzzle.getContext("2d");
puzzle.width = parseInt(width) * boxWidth;
puzzle.height = parseInt(height) * boxWidth;

initializeGrid = () => {
  // Configure canvas size
  canvas.width = width * boxWidth;
  canvas.height = height * boxWidth;

  // Empty grid and history
  grid = [];
  history = [];
  maxColorsX = 0;
  maxColorsY = 0;

  // Initialize the grid with white tiles
  for (let y = 0; y < height; y++) {
    grid.push([]);
    puzzleGrid.push([]);
    for (let x = 0; x < width; x++) {
      grid[y].push("#ffffff");
      puzzleGrid[y].push(0);
    }
  }

  saveToHistory();
  drawTiles(grid);
};

drawTiles = arr => {
  // For tile borders
  ctx.fillStyle = "#8e8e8e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draws from grid
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ctx.fillStyle = arr[y][x];
      ctx.fillRect(
        x * boxWidth + (maxColorsX ? maxColorsX * boxWidth + 2 : 1),
        y * boxWidth + (maxColorsY ? maxColorsY * boxWidth + 2 : 1),
        boxWidth - (x === width - 1 || (x + 1) % 5 === 0 ? 2 : 1),
        boxWidth - (y === height - 1 || (y + 1) % 5 === 0 ? 2 : 1)
      );
    }
  }
};

handleCanvasUpdate = e => {
  // Handles canvas size and color updates
  if (e.target.name === "width") {
    if (history.length > 1) {
      if (
        window.confirm("Resizing will delete your masterpiece. Are you sure?")
      ) {
        width = e.target.value;
        puzzle.width = width;
        initializeGrid();
      } else {
        e.target.value = width;
        puzzle.width = width;
      }
    } else {
      width = e.target.value;
      puzzle.width = width;
      initializeGrid();
    }
  } else if (e.target.name === "height") {
    if (history.length > 1) {
      if (
        window.confirm("Resizing will delete your masterpiece. Are you sure?")
      ) {
        height = e.target.value;
        puzzle.height = height;
        initializeGrid();
      } else {
        e.target.value = height;
        puzzle.height = height;
      }
    } else {
      height = e.target.value;
      puzzle.height = height;
      initializeGrid();
    }
  } else if (e.target.name === "colorOne") {
    console.log("updating");
    colorOne = e.target.value;
  } else if (e.target.name === "colorTwo") {
    colorTwo = e.target.value;
  }
};

saveToHistory = () => {
  // Saves the last grid change to history
  console.log("saving", history);
  history.push([]);
  grid.forEach((y, indexY) => {
    history[history.length - 1].push([]);

    y.forEach(x => {
      history[history.length - 1][indexY].push(x);
    });
  });
  console.log(grid);
};

handleUndo = () => {
  // Delete the last change in the grid
  if (history.length > 1) {
    history.pop();
  }

  // Remap the grid
  grid = [];
  history[history.length - 1].forEach((y, indexY) => {
    grid.push([]);

    y.forEach(x => {
      grid[indexY].push(x);
    });
  });

  // Recreate the puzzle
  maxColorsX = 0;
  maxColorsY = 0;
  handleCreatePuzzle();
};

handleCreatePuzzle = () => {
  let lastColor = "#ffffff";
  rows = [];
  columns = [];
  maxColorsX = 0;
  maxColorsY = 0;

  // Map grid to puzzle columns
  for (let x = 0; x < parseInt(width); x++) {
    columns.push([]);
    for (let y = 0; y < parseInt(height); y++) {
      if (grid[y][x] !== "#ffffff") {
        if (!columns[x].length) {
          console.log("first color [y]");
          columns[x].push({ color: grid[y][x], count: 1 });
          lastColor = grid[y][x];
        } else if (lastColor === grid[y][x]) {
          console.log("same color [y]");
          columns[x][columns[x].length - 1].count++;
        } else if (lastColor !== grid[y][x]) {
          console.log("new color [y]");
          columns[x].push({ color: grid[y][x], count: 1 });
          lastColor = grid[y][x];
        }
      } else {
        lastColor = "#ffffff";
      }
    }

    if (columns[x].length > maxColorsY) maxColorsY = columns[x].length;
  }
  console.log("column test:", maxColorsY, columns);

  // Map grid to puzzle rows
  lastColor = "#ffffff";
  grid.forEach((y, indexY) => {
    console.log(grid[indexY]);
    rows.push([]);
    grid[indexY].forEach((x, indexX) => {
      if (x !== "#ffffff") {
        if (!rows[indexY].length) {
          console.log("...first color");
          rows[indexY].push({ color: x, count: 1 });
          lastColor = x;
        } else if (lastColor === x) {
          console.log("...same color");
          rows[indexY][rows[indexY].length - 1].count++;
        } else if (lastColor !== x) {
          console.log("...new color");
          rows[indexY].push({ color: x, count: 1 });
          lastColor = x;
        }
      } else {
        lastColor = "#ffffff";
      }
    });

    if (rows[indexY].length > maxColorsX) maxColorsX = rows[indexY].length;
  });

  // Draws puzzle numbers and grid
  if (maxColorsX || maxColorsY) {
    canvas.width = width * boxWidth + maxColorsX * boxWidth + 1;
    canvas.height = height * boxWidth + maxColorsY * boxWidth + 1;
    drawTiles(grid);

    // Black border
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, maxColorsY * boxWidth + 1);
    ctx.fillRect(0, 0, maxColorsX * boxWidth + 1, canvas.height);

    // Tile borders
    ctx.fillStyle = "#8e8e8e";
    ctx.fillRect(0, 0, maxColorsX * boxWidth, maxColorsY * boxWidth);
    ctx.fillRect(
      maxColorsX * boxWidth + 1,
      0,
      canvas.width,
      maxColorsY * boxWidth
    );
    ctx.fillRect(
      0,
      maxColorsY * boxWidth + 1,
      maxColorsX * boxWidth,
      canvas.height
    );

    // Displays colorOne
    ctx.fillStyle = colorOne;
    ctx.fillRect(1, 1, maxColorsX * boxWidth - 1, maxColorsY * boxWidth - 1);

    // Draw puzzle columns
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < maxColorsY; y++) {
        if (y >= maxColorsY - columns[x].length) {
          // Draw color
          ctx.fillStyle =
            columns[x][y - (maxColorsY - columns[x].length)].color;
          ctx.fillRect(
            x * boxWidth + (maxColorsX ? maxColorsX * boxWidth + 2 : 1),
            y * boxWidth + 1,
            boxWidth - (x === width - 1 || (x + 1) % 5 === 0 ? 2 : 1),
            boxWidth - (y === maxColorsY - 1 ? 2 : 1)
          );

          // Write color amount
          let colorCode = columns[x][
            y - (maxColorsY - columns[x].length)
          ].color.slice(1, 7);
          let colorVal =
            parseInt(colorCode.slice(0, 2), 16) +
            parseInt(colorCode.slice(2, 4), 16) +
            parseInt(colorCode.slice(4, 6), 16);
          if (colorVal > 382) {
            ctx.fillStyle = "#000000";
          } else {
            ctx.fillStyle = "#ffffff";
          }
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            columns[x][y - (maxColorsY - columns[x].length)].count,
            (x + maxColorsX + 0.5) * boxWidth,
            (y + 0.8) * boxWidth
          );
        } else {
          // Empty puzzle tile
          ctx.fillStyle = "#d9d9d9";
          ctx.fillRect(
            x * boxWidth + (maxColorsX * boxWidth + 2),
            y * boxWidth + 1,
            boxWidth - (x === width - 1 || (x + 1) % 5 === 0 ? 2 : 1),
            boxWidth - (y === maxColorsY - 1 ? 2 : 1)
          );
        }
      }
    }

    // Draw puzzle rows
    for (let y = 0; y < height; y++) {
      console.log("each y", maxColorsX, rows[y].length);
      for (let x = 0; x < maxColorsX; x++) {
        if (x >= maxColorsX - rows[y].length) {
          console.log(rows, y, x);

          // Draw color
          ctx.fillStyle = rows[y][x - (maxColorsX - rows[y].length)].color;
          ctx.fillRect(
            x * boxWidth + 1,
            y * boxWidth + (maxColorsY ? maxColorsY * boxWidth + 2 : 1),
            boxWidth - (x === maxColorsX - 1 ? 2 : 1),
            boxWidth - (y === height - 1 || (y + 1) % 5 === 0 ? 2 : 1)
          );

          // Write color amount
          let colorCode = rows[y][
            x - (maxColorsX - rows[y].length)
          ].color.slice(1, 7);
          let colorVal =
            parseInt(colorCode.slice(0, 2), 16) +
            parseInt(colorCode.slice(2, 4), 16) +
            parseInt(colorCode.slice(4, 6), 16);
          if (colorVal > 382) {
            ctx.fillStyle = "#000000";
          } else {
            ctx.fillStyle = "#ffffff";
          }
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            rows[y][x - (maxColorsX - rows[y].length)].count,
            (x + 0.5) * boxWidth,
            (y + maxColorsY + 0.8) * boxWidth
          );
        } else {
          // Empty puzzle tile
          ctx.fillStyle = "#d9d9d9";
          ctx.fillRect(
            x * boxWidth + 1,
            y * boxWidth + (maxColorsY * boxWidth + 2),
            boxWidth - (x === maxColorsX - 1 ? 2 : 1),
            boxWidth - (y === height - 1 || (y + 1) % 5 === 0 ? 2 : 1)
          );
        }
      }
    }
  } else {
    // Grid is empty
    canvas.width = width * boxWidth;
    drawTiles(grid);
  }

  // for (let y = 0; y < height; y++) {
  //   for (let x = 0; x < width; x++) {
  //     pctx.fillStyle = grid[y][x];
  //     pctx.fillRect(x * boxWidth, y * boxWidth, boxWidth, boxWidth);
  //   }
  // }

  console.log(canvas.toDataURL("image/png"));
  console.log(puzzle.toDataURL("image/png"));
};

checkSolvability = () => {
  // Reset visual
  pctx.fillStyle = "#ffffff";
  pctx.fillRect(0, 0, width * boxWidth, height * boxWidth);
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < columns.length; x++) {
      puzzleGrid[y][x] = 0;
    }
  }

  for (let y = 0; y < rows.length; y++) {
    // Check for empty row, fill with X's
    if (!rows[y].length) {
      for (let x = 0; x < columns.length; x++) {
        pctx.strokeStyle = "#000000";
        pctx.lineWidth = 2;
        pctx.beginPath();
        pctx.moveTo(x * boxWidth, y * boxWidth);
        pctx.lineTo((x + 1) * boxWidth, (y + 1) * boxWidth);
        pctx.moveTo(x * boxWidth, (y + 1) * boxWidth);
        pctx.lineTo((x + 1) * boxWidth, y * boxWidth);
        pctx.stroke();

        puzzleGrid[y][x] = "X";
      }
    } else {
      let count = 0;
      rows[y].forEach(val => {
        count += val.count;
      });
      if (count === columns.length) {
      }
    }
  }

  for (let x = 0; x < columns.length; x++) {
    // Check for empty column, fill with X's
    if (!columns[x].length) {
      for (let y = 0; y < rows.length; y++) {
        if (puzzleGrid[y][x] !== "X") {
          pctx.strokeStyle = "#000000";
          pctx.lineWidth = 2;
          pctx.beginPath();
          pctx.moveTo(x * boxWidth, y * boxWidth);
          pctx.lineTo((x + 1) * boxWidth, (y + 1) * boxWidth);
          pctx.moveTo(x * boxWidth, (y + 1) * boxWidth);
          pctx.lineTo((x + 1) * boxWidth, y * boxWidth);
          pctx.stroke();

          puzzleGrid[y][x] = "X";
        } else {
          console.log("dupe");
        }
      }
    }
  }
  console.log(puzzleGrid);
};

canvas.addEventListener("mousedown", e => {
  // Obtain click coordinates, accounting for the 1px border if showing puzzle
  let x = Math.floor((e.offsetX - (maxColorsX ? 1 : 0)) / boxWidth);
  let y = Math.floor((e.offsetY - (maxColorsY ? 1 : 0)) / boxWidth);
  console.log("clicked", e.offsetX, e.offsetY, x, y);

  // If click was on a tile, not the puzzle numbers
  if (
    maxColorsX <= x &&
    x < parseInt(width) + maxColorsX &&
    maxColorsY <= y &&
    y < parseInt(height) + maxColorsY
  ) {
    console.log(maxColorsX, x, parseInt(width) + maxColorsX);

    // Set dragging status for mouse move event
    draggingStatus = e.button;
    if (draggingStatus === 0) ctx.fillStyle = colorOne;
    else if (draggingStatus === 2) ctx.fillStyle = colorTwo;

    // Color the clicked tile, check if it's a 5th tile for extra border
    ctx.fillRect(
      x * boxWidth + (maxColorsX ? 2 : 1),
      y * boxWidth + (maxColorsY ? 2 : 1),
      boxWidth -
        (x - maxColorsX === width - 1 || (x + 1 - maxColorsX) % 5 === 0
          ? 2
          : 1),
      boxWidth -
        (y - maxColorsY === height - 1 || (y + 1 - maxColorsY) % 5 === 0
          ? 2
          : 1)
    );

    // Update the grid
    grid[y - maxColorsY][x - maxColorsX] = ctx.fillStyle;
  }
});

canvas.addEventListener("mousemove", e => {
  if (draggingStatus === 0 || draggingStatus === 2) {
    // Obtain mouse move coordinates, accounting for the 1px border if showing puzzle
    let x = Math.floor((e.offsetX - (maxColorsX ? 1 : 0)) / boxWidth);
    let y = Math.floor((e.offsetY - (maxColorsY ? 1 : 0)) / boxWidth);
    console.log("dragged", e.offsetX, e.offsetY, x, y, "max", maxColorsX);

    // If mouse has moved to a tile, not the puzzle numbers
    if (
      maxColorsX <= x &&
      x < parseInt(width) + maxColorsX &&
      maxColorsY <= y &&
      y < parseInt(height) + maxColorsY
    ) {
      if (draggingStatus === 0) ctx.fillStyle = colorOne;
      else if (draggingStatus === 2) ctx.fillStyle = colorTwo;

      // If hovered tile does not match the selected color
      if (grid[y - maxColorsY][x - maxColorsX] !== ctx.fillStyle) {
        console.log("color", x, y);
        ctx.fillRect(
          x * boxWidth + (maxColorsX ? 2 : 1),
          y * boxWidth + (maxColorsY ? 2 : 1),
          boxWidth -
            (x - maxColorsX === width - 1 || (x + 1 - maxColorsX) % 5 === 0
              ? 2
              : 1),
          boxWidth -
            (y - maxColorsY === height - 1 || (y + 1 - maxColorsY) % 5 === 0
              ? 2
              : 1)
        );

        // Update the grid
        grid[y - maxColorsY][x - maxColorsX] = ctx.fillStyle;
      }
    } else {
      console.log("out of bounds");
    }
  }
});

canvas.addEventListener("mouseup", e => {
  if (draggingStatus !== -1) {
    saveToHistory();
  }
  draggingStatus = -1;
});

document.documentElement.addEventListener("mouseup", () => {
  if (draggingStatus !== -1) {
    draggingStatus = -1;
    saveToHistory();
  }
});

initializeGrid();
