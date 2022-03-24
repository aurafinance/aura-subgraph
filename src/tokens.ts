import { Address } from '@graphprotocol/graph-ts'

import { Token } from '../generated/schema'
import { ERC20 } from '../generated/Booster/ERC20'

export function getToken(address: Address): Token {
  let id = address.toHexString()
  let token = Token.load(id)

  if (token == null) {
    token = new Token(id)
    let contract = ERC20.bind(address)
    token.name = contract.name()
    token.decimals = contract.decimals()
    token.symbol = contract.symbol()
    token.save()
    return token as Token
  }

  return token as Token
}
