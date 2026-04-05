module.exports = {
  mkdirP: jest.fn(dir =>
    require('fs/promises')
      .mkdir(dir, {recursive: true})
      .catch(() => {})
  ),
  rmRF: jest.fn(p =>
    require('fs/promises').rm(p, {recursive: true, force: true})
  )
}
