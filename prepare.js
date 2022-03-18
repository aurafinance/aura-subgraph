#!/bin/node

const Mustache = require('mustache')
const deployments = require('./deployments.json')
const fs = require('fs')

const networkName = process.argv.pop()

if (!deployments[networkName]) {
    throw new Error(`Network ${networkName} not found`)
}

const template = fs.readFileSync('./subgraph.template.yaml', 'utf8')
fs.writeFileSync('./subgraph.yaml', Mustache.render(template, deployments[networkName]))
