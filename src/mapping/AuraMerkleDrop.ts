import { Address } from '@graphprotocol/graph-ts'

import {
  Claimed,
  RootSet,
  StartedEarly,
  AuraMerkleDrop,
} from '../../generated/BalancerMerkleDrop/AuraMerkleDrop'
import { MerkleDrop, MerkleDropClaim } from '../../generated/schema'

import { getAccount } from '../accounts'
import { PenaltyForwarded, Rescued } from '../../generated/future/AuraMerkleDrop'

function getMerkleDrop(address: Address): MerkleDrop {
  let id = address.toHex()
  let merkleDrop = MerkleDrop.load(id)
  if (merkleDrop != null) {
    return merkleDrop as MerkleDrop
  }

  let contract = AuraMerkleDrop.bind(address)

  merkleDrop = new MerkleDrop(id)
  merkleDrop.merkleRoot = contract.merkleRoot()
  merkleDrop.expiryTime = contract.expiryTime().toI32()
  merkleDrop.startTime = contract.startTime().toI32()
  merkleDrop.save()

  return merkleDrop as MerkleDrop
}

export function handleClaimed(event: Claimed): void {
  let merkleDrop = getMerkleDrop(event.address)
  let account = getAccount(event.params.addr)

  let claim = new MerkleDropClaim(merkleDrop.id + '.' + account.id)
  claim.merkleDrop = merkleDrop.id
  claim.account = account.id
  claim.amount = event.params.amt
  claim.locked = event.params.locked
  claim.save()
}

export function handleRootSet(event: RootSet): void {
  let merkleDrop = getMerkleDrop(event.address)
  let contract = AuraMerkleDrop.bind(event.address)
  merkleDrop.merkleRoot = contract.merkleRoot()
  merkleDrop.save()
}

export function handleStartedEarly(event: StartedEarly): void {
  let merkleDrop = getMerkleDrop(event.address)
  let contract = AuraMerkleDrop.bind(event.address)
  merkleDrop.startTime = contract.startTime().toI32()
  merkleDrop.save()
}

export function handlePenaltyForwarded(event: PenaltyForwarded): void {
  // do nothing
}

export function handleRescued(event: Rescued): void {
  // do nothing
}
