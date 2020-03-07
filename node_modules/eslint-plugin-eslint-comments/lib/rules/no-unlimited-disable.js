/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const utils = require("../internal/utils")

const PATTERNS = {
    Block: /^\s*(eslint-disable)\s*(\S)?/u,
    Line: /^\s*(eslint-disable(?:-next)?-line)\s*(\S)?/u,
}

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "disallow `eslint-disable` comments without rule names",
            category: "Best Practices",
            recommended: true,
            url:
                "https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-unlimited-disable.html",
        },
        fixable: null,
        schema: [],
    },

    create(context) {
        const sourceCode = context.getSourceCode()

        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    const pattern = PATTERNS[comment.type]
                    if (pattern == null) {
                        continue
                    }

                    const m = pattern.exec(comment.value)
                    if (m && !m[2]) {
                        context.report({
                            loc: utils.toForceLocation(comment.loc),
                            message:
                                "Unexpected unlimited '{{kind}}' comment. Specify some rule names to disable.",
                            data: { kind: m[1] },
                        })
                    }
                }
            },
        }
    },
}
