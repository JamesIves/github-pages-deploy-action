/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const utils = require("../internal/utils")
const PATTERNS = {
    Block: /^\s*(eslint(?:-disable|-enable|-env)?|exported|globals?)(?:\s|$)/u,
    Line: /^\s*(eslint-disable(?:-next)?-line)(?:\s|$)/u,
}

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "disallow ESLint directive-comments",
            category: "Stylistic Issues",
            recommended: false,
            url:
                "https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-use.html",
        },
        fixable: null,
        schema: [
            {
                type: "object",
                properties: {
                    allow: {
                        type: "array",
                        items: {
                            enum: [
                                "eslint",
                                "eslint-disable",
                                "eslint-disable-line",
                                "eslint-disable-next-line",
                                "eslint-enable",
                                "eslint-env",
                                "exported",
                                "global",
                                "globals",
                            ],
                        },
                        additionalItems: false,
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
    },

    create(context) {
        const sourceCode = context.getSourceCode()
        const allowed = new Set(
            (context.options[0] && context.options[0].allow) || []
        )

        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    const pattern = PATTERNS[comment.type]
                    if (pattern == null) {
                        continue
                    }

                    const m = pattern.exec(comment.value)
                    if (m != null && !allowed.has(m[1])) {
                        context.report({
                            loc: utils.toForceLocation(comment.loc),
                            message: "Unexpected ESLint directive comment.",
                        })
                    }
                }
            },
        }
    },
}
