export type Mat4 = Float32Array
export type Vec3 = [number, number, number]

export function mat4Create(): Mat4 {
  const out = new Float32Array(16)
  out[0] = 1
  out[5] = 1
  out[10] = 1
  out[15] = 1
  return out
}

export function mat4Identity(out: Mat4): Mat4 {
  out.fill(0)
  out[0] = 1
  out[5] = 1
  out[10] = 1
  out[15] = 1
  return out
}

export function mat4Perspective(out: Mat4, fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2)
  const nf = 1 / (near - far)
  out.fill(0)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) * nf
  out[11] = -1
  out[14] = 2 * far * near * nf
  return out
}

export function mat4LookAt(out: Mat4, eye: Vec3, center: Vec3, up: Vec3): Mat4 {
  let z0 = eye[0] - center[0]
  let z1 = eye[1] - center[1]
  let z2 = eye[2] - center[2]
  let length = 1 / Math.hypot(z0, z1, z2)
  z0 *= length
  z1 *= length
  z2 *= length

  let x0 = up[1] * z2 - up[2] * z1
  let x1 = up[2] * z0 - up[0] * z2
  let x2 = up[0] * z1 - up[1] * z0
  length = Math.hypot(x0, x1, x2)
  if (length) {
    length = 1 / length
    x0 *= length
    x1 *= length
    x2 *= length
  }

  let y0 = z1 * x2 - z2 * x1
  let y1 = z2 * x0 - z0 * x2
  let y2 = z0 * x1 - z1 * x0
  length = Math.hypot(y0, y1, y2)
  if (length) {
    length = 1 / length
    y0 *= length
    y1 *= length
    y2 *= length
  }

  out[0] = x0
  out[1] = y0
  out[2] = z0
  out[3] = 0
  out[4] = x1
  out[5] = y1
  out[6] = z1
  out[7] = 0
  out[8] = x2
  out[9] = y2
  out[10] = z2
  out[11] = 0
  out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2])
  out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2])
  out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2])
  out[15] = 1
  return out
}

function mat4Multiply(out: Mat4, a: Mat4, b: Mat4): Mat4 {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]
  for (let column = 0; column < 4; column += 1) {
    const offset = column * 4
    const b0 = b[offset], b1 = b[offset + 1], b2 = b[offset + 2], b3 = b[offset + 3]
    out[offset] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[offset + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[offset + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[offset + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
  }
  return out
}

export function mat4Translate(out: Mat4, a: Mat4, [x, y, z]: Vec3): Mat4 {
  out[12] = a[0] * x + a[4] * y + a[8] * z + a[12]
  out[13] = a[1] * x + a[5] * y + a[9] * z + a[13]
  out[14] = a[2] * x + a[6] * y + a[10] * z + a[14]
  out[15] = a[3] * x + a[7] * y + a[11] * z + a[15]
  return out
}

export function mat4Scale(out: Mat4, a: Mat4, [x, y, z]: Vec3): Mat4 {
  out[0] = a[0] * x
  out[1] = a[1] * x
  out[2] = a[2] * x
  out[3] = a[3] * x
  out[4] = a[4] * y
  out[5] = a[5] * y
  out[6] = a[6] * y
  out[7] = a[7] * y
  out[8] = a[8] * z
  out[9] = a[9] * z
  out[10] = a[10] * z
  out[11] = a[11] * z
  return out
}

export function mat4RotateEuler(out: Mat4, a: Mat4, x: number, y: number, z: number): Mat4 {
  const cx = Math.cos(x), sx = Math.sin(x)
  const cy = Math.cos(y), sy = Math.sin(y)
  const cz = Math.cos(z), sz = Math.sin(z)
  const rotation = new Float32Array([
    cy * cz, cy * sz, -sy, 0,
    sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy, 0,
    cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy, 0,
    0, 0, 0, 1,
  ])
  return mat4Multiply(out, a, rotation)
}

export function mat3NormalFromMat4(out: Float32Array, a: Mat4): Float32Array {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]
  const b00 = a00 * a11 - a01 * a10
  const b01 = a00 * a12 - a02 * a10
  const b02 = a00 * a13 - a03 * a10
  const b03 = a01 * a12 - a02 * a11
  const b04 = a01 * a13 - a03 * a11
  const b05 = a02 * a13 - a03 * a12
  const b06 = a20 * a31 - a21 * a30
  const b07 = a20 * a32 - a22 * a30
  const b08 = a20 * a33 - a23 * a30
  const b09 = a21 * a32 - a22 * a31
  const b10 = a21 * a33 - a23 * a31
  const b11 = a22 * a33 - a23 * a32
  let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06
  if (!determinant) return out
  determinant = 1 / determinant
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * determinant
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * determinant
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * determinant
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * determinant
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * determinant
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * determinant
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * determinant
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * determinant
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * determinant
  return out
}
