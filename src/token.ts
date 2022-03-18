import { Address } from '@graphprotocol/graph-ts'
import { Token } from '../generated/schema'
import { ERC20 } from '../generated/Booster/ERC20'

export function getToken(address: Address): Token {
  let token = Token.load(address.toHex())
  if (!token) {
    token = new Token(address.toHex())
    let tokenContract = ERC20.bind(address)
    token.name = tokenContract.name()
    token.symbol = tokenContract.symbol()
    token.save()
  }
  return token
}
