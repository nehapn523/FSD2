// mathHelper.js
export function transpose(m) {
  return m[0].map((_, i) => m.map((r) => r[i]));
}

export function multiply(a, b) {
  if (Array.isArray(a[0])) {
    if (Array.isArray(b[0])) {
      let result = Array(a.length)
        .fill()
        .map(() => Array(b[0].length).fill(0));
      for (let i = 0; i < a.length; i++)
        for (let j = 0; j < b[0].length; j++)
          for (let k = 0; k < b.length; k++) result[i][j] += a[i][k] * b[k][j];
      return result;
    } else {
      return a.map((row) => row.reduce((sum, v, i) => sum + v * b[i], 0));
    }
  } else {
    return a.reduce((sum, v, i) => sum + v * b[i], 0);
  }
}

export function lusolve(A, b) {
  const n = A.length;
  const M = A.map((row) => row.slice());
  const x = Array(n).fill(0);
  b = b.slice();
  for (let k = 0; k < n; k++) {
    let maxRow = k;
    for (let i = k + 1; i < n; i++)
      if (Math.abs(M[i][k]) > Math.abs(M[maxRow][k])) maxRow = i;
    [M[k], M[maxRow]] = [M[maxRow], M[k]];
    [b[k], b[maxRow]] = [b[maxRow], b[k]];
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k];
      for (let j = k; j < n; j++) M[i][j] -= f * M[k][j];
      b[i] -= f * b[k];
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) sum -= M[i][j] * x[j];
    x[i] = sum / M[i][i];
  }
  return x.map((v) => [v]);
}

export function ridgeRegression(X, y, alpha = 0.85) {
  const n = X.length,
    d = X[0].length;

  const XT = transpose(X);
  const XTX = multiply(XT, X);

  for (let i = 0; i < d; i++) XTX[i][i] += alpha;

  const XTy = multiply(XT, y);
  const w = lusolve(XTX, XTy).map((v) => v[0]);

  let meanX = Array(d).fill(0), meanY = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) meanX[j] += X[i][j];
    meanY += y[i];
  }

  meanX = meanX.map((v) => v / n);
  meanY /= n;

  const b = meanY - meanX.reduce((acc, v, j) => acc + v * w[j], 0);

  return { w, b };
}

export function predictRidge(model, xi) {
  let { w, b } = model;
  let res = b;
  for (let i = 0; i < w.length; i++) res += w[i] * xi[i];
  return res;
}

export function computeNorms(data, keys) {
  const mean = {}, std = {};
  keys.forEach((k) => {
    const values = data.map((d) => parseFloat(d[k]) || 0);
    mean[k] = values.reduce((a, b) => a + b, 0) / values.length;
    std[k] = Math.sqrt(
      values.reduce((a, b) => a + (b - mean[k]) ** 2, 0) / values.length
    );
    if (std[k] === 0) std[k] = 1;
  });
  return { mean, std };
}
