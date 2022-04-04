import { Address } from '@graphprotocol/graph-ts'

import { Transfer } from '../../generated/AuraToken/ERC20'
import { Global } from '../../generated/schema'

export function handleTransfer(event: Transfer): void {
  let global = Global.load('global')
  if (global == null) return

  if (event.params.to.equals(Address.zero())) {
    global.auraTotalSupply = global.auraTotalSupply.minus(event.params.value)
  } else if (event.params.from.equals(Address.zero())) {
    global.auraTotalSupply = global.auraTotalSupply.plus(event.params.value)
  }
  global.save()
}
