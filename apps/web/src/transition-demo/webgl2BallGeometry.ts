export interface SphereGeometry {
  indices: Uint16Array
  normals: Float32Array
  positions: Float32Array
}

export function createSphereGeometry(radius = 1, widthSegments = 64, heightSegments = 48): SphereGeometry {
  const vertexCount = (widthSegments + 1) * (heightSegments + 1)
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const indices = new Uint16Array(widthSegments * heightSegments * 6)
  let vertexIndex = 0

  for (let y = 0; y <= heightSegments; y += 1) {
    const theta = (y / heightSegments) * Math.PI
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)
    for (let x = 0; x <= widthSegments; x += 1) {
      const phi = (x / widthSegments) * Math.PI * 2
      const nx = -sinTheta * Math.cos(phi)
      const ny = cosTheta
      const nz = sinTheta * Math.sin(phi)
      positions[vertexIndex * 3] = nx * radius
      positions[vertexIndex * 3 + 1] = ny * radius
      positions[vertexIndex * 3 + 2] = nz * radius
      normals[vertexIndex * 3] = nx
      normals[vertexIndex * 3 + 1] = ny
      normals[vertexIndex * 3 + 2] = nz
      vertexIndex += 1
    }
  }

  let index = 0
  const stride = widthSegments + 1
  for (let y = 0; y < heightSegments; y += 1) {
    for (let x = 0; x < widthSegments; x += 1) {
      const a = y * stride + x
      const b = (y + 1) * stride + x
      const c = b + 1
      const d = a + 1
      indices[index++] = a
      indices[index++] = b
      indices[index++] = d
      indices[index++] = b
      indices[index++] = c
      indices[index++] = d
    }
  }

  return { indices, normals, positions }
}
