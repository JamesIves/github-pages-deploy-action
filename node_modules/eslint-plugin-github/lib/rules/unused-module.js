const depGraph = require('../dependency-graph')

module.exports = {
  meta: {
    docs: {}
  },

  create(context) {
    const filename = context.getFilename()

    if (depGraph.entries.has(filename)) {
      return {}
    }

    return {
      Program(node) {
        const {filenames} = depGraph.imported()
        if (!filenames.has(filename)) {
          context.report(node, 'Module was not imported by any files.')
        }
      }
    }
  }
}
