#!/bin/node

import { promises as fs } from 'fs'
import path from 'path'
import { globby } from 'globby'

const [contractsDir] = process.argv.slice(2)

if (!contractsDir) {
  throw new Error('Argument required (path to aura-contracts directory)')
}

const main = async () => {
  const artifactsPath = `${contractsDir}/artifacts`

  // Pick the file paths we might need
  let paths = await globby([
    `${artifactsPath}/**/*.json`,
    `!${artifactsPath}/**/*.dbg.json`,
  ])

  // Filter what we're using in the template
  const template = await fs.readFile('./subgraph.template.yaml', 'utf8')
  const matches = [...template.matchAll(/file:\s+.\/abis(\/\w+\.json)/g)]
  const contracts = matches.map((match) => match[1])
  paths = paths.filter((path) =>
    contracts.some((contract) => path.endsWith(contract)),
  )

  // Copy over
  await Promise.all(
    paths.map(async (srcPath) => {
      const fileName = path.parse(srcPath).base
      const destPath = path.join(path.resolve(), '/abis/', fileName)
      await fs.copyFile(srcPath, destPath)
    }),
  )
  console.log(`Copied ${paths.length} ABIs.`)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
