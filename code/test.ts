#!/usr/bin/env node

const tap = require("tap")
const lodash = require("lodash")
const grammarNode = require("jtree/products/grammar.nodejs.js")
const { Disk } = require("jtree/products/Disk.node.js")
const { ScrollFolder } = require("scroll-cli")

import { scrollFolders, getCleanedId } from "./utils"

const runTree = testTree =>
	Object.keys(testTree).forEach(key => {
		testTree[key](tap.equal)
	})

const testTree: any = {}

testTree.ensureNoErrorsInScrollExtensions = areEqual => {
	const scrollFolder = new ScrollFolder(__dirname)
	const { grammarErrors } = scrollFolder
	if (grammarErrors.length) console.log(grammarErrors)
	areEqual(grammarErrors.length, 0, "no errors in scroll extensions")
}

// todo
testTree.ensureNoErrorsInBlog = areEqual => {
	const checkScroll = folderPath => {
		const folder = new ScrollFolder(folderPath)
		areEqual(
			folder.grammarErrors.length,
			0,
			`no grammarErrors in ${folderPath}`
		)
		//areEqual(folder.errors.length, 0, `no errors in ${folderPath}`)
	}

	scrollFolders().map(checkScroll)
}

testTree.ensureFieldsAreTrimmed = areEqual => {
	const scrollFolder = new ScrollFolder(__dirname)
	const { grammarErrors } = scrollFolder
	if (grammarErrors.length) console.log(grammarErrors)
	areEqual(grammarErrors.length, 0, "no errors in scroll extensions")
}

if (module && !module.parent) runTree(testTree)

module.exports = { testTree }
