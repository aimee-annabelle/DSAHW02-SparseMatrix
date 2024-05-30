const fs = require("fs");

class SparseMatrix {
  constructor(filePath = null, numRows = null, numCols = null) {
    if (filePath) {
      this.readFromFile(filePath);
    } else {
      this.rows = numRows;
      this.cols = numCols;
      this.data = new Map();
    }
  }

  readFromFile(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("Input file has wrong format");
    }

    this.rows = parseInt(lines[0].split("=")[1]);
    this.cols = parseInt(lines[1].split("=")[1]);
    this.data = new Map();

    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("(") && line.endsWith(")")) {
        const elements = line
          .slice(1, -1)
          .split(",")
          .map((x) => x.trim());
        if (elements.length !== 3) {
          throw new Error("Input file has wrong format");
        }
        const [row, col, value] = elements.map(Number);
        if (Number.isNaN(row) || Number.isNaN(col) || Number.isNaN(value)) {
          throw new Error("Input file has wrong format");
        }
        this.setElement(row, col, value);
      } else {
        throw new Error("Input file has wrong format");
      }
    }
  }

  getElement(currRow, currCol) {
    return this.data.get(`${currRow},${currCol}`) || 0;
  }

  setElement(currRow, currCol, value) {
    if (value === 0) {
      this.data.delete(`${currRow},${currCol}`);
    } else {
      this.data.set(`${currRow},${currCol}`, value);
    }
  }

  add(matrix) {
    if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
      throw new Error("Matrix dimensions must match for addition");
    }

    const result = new SparseMatrix(null, this.rows, this.cols);

    this.data.forEach((value, key) => {
      const [row, col] = key.split(",").map(Number);
      result.setElement(row, col, value + matrix.getElement(row, col));
    });

    matrix.data.forEach((value, key) => {
      if (!this.data.has(key)) {
        const [row, col] = key.split(",").map(Number);
        result.setElement(row, col, value + this.getElement(row, col));
      }
    });

    return result;
  }

  subtract(matrix) {
    if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
      throw new Error("Matrix dimensions must match for subtraction");
    }

    const result = new SparseMatrix(null, this.rows, this.cols);

    this.data.forEach((value, key) => {
      const [row, col] = key.split(",").map(Number);
      result.setElement(row, col, value - matrix.getElement(row, col));
    });

    matrix.data.forEach((value, key) => {
      if (!this.data.has(key)) {
        const [row, col] = key.split(",").map(Number);
        result.setElement(row, col, -value + this.getElement(row, col));
      }
    });

    return result;
  }

  multiply(matrix) {
    if (this.cols !== matrix.rows) {
      throw new Error("Matrix dimensions must match for multiplication");
    }

    const result = new SparseMatrix(null, this.rows, matrix.cols);

    this.data.forEach((valueA, keyA) => {
      const [rowA, colA] = keyA.split(",").map(Number);

      for (let colB = 0; colB < matrix.cols; colB++) {
        const valueB = matrix.getElement(colA, colB);
        if (valueB !== 0) {
          const currentValue = result.getElement(rowA, colB);
          result.setElement(rowA, colB, currentValue + valueA * valueB);
        }
      }
    });

    return result;
  }
  toString() {
    let result = `rows=${this.rows}\ncols=${this.cols}\n`;
    this.data.forEach((value, key) => {
      result += `(${key}, ${value})\n`;
    });
    return result;
  }
}

function writeMatrixToFile(matrix, filePath) {
  const content = matrix.toString();
  fs.writeFileSync(filePath, content, "utf-8");
}

try {
  const matrixA = new SparseMatrix("../input_files/matrixA.txt");
  const matrixB = new SparseMatrix("../input_files/matrixB.txt");

  const sumMatrix = matrixA.add(matrixB);
  const diffMatrix = matrixA.subtract(matrixB);
  //   const prodMatrix = matrixA.multiply(matrixB);
  writeMatrixToFile(sumMatrix, "../output_files/sumMatrix.txt");
  writeMatrixToFile(diffMatrix, "../output_files/diffMatrix.txt");
  // writeMatrixToFile(prodMatrix, '../output_files/prodMatrix.txt');
} catch (error) {
  console.error(error.message);
}
