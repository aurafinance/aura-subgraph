import { Address } from '@graphprotocol/graph-ts'

import {
  DelegateChanged,
  DelegateCheckpointed,
  KickIncentiveSet,
  KickReward,
  OwnershipTransferred,
  Recovered,
  RewardAdded,
  RewardPaid,
  Shutdown,
  Staked,
  Withdrawn,
} from '../../generated/AuraLocker/AuraLocker'
import { AuraLocker } from '../../generated/schema'
import { updateAuraLockerRewardData } from '../rewards'
import { getCvxLockerAccount } from '../accounts'

function getLocker(address: Address): AuraLocker {
  let id = 'AuraLocker'
  let locker = AuraLocker.load(id)

  if (locker == null) {
    locker = new AuraLocker(id)
    locker.address = address
    locker.save()
    return locker as AuraLocker
  }

  return locker as AuraLocker
}

export function handleDelegateChanged(event: DelegateChanged): void {
  let locker = getLocker(event.address)
  // TODO
}

export function handleDelegateCheckpointed(event: DelegateCheckpointed): void {
  let locker = getLocker(event.address)
  // TODO
}

export function handleKickIncentiveSet(event: KickIncentiveSet): void {
  let locker = getLocker(event.address)
  // TODO
}

export function handleKickReward(event: KickReward): void {
  let locker = getLocker(event.address)
  let account = getCvxLockerAccount(event.params._user)
  // TODO
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let locker = getLocker(event.address)
  // TODO
}

export function handleRecovered(event: Recovered): void {
  let locker = getLocker(event.address)
  // TODO
}

export function handleRewardAdded(event: RewardAdded): void {
  let locker = getLocker(event.address)
  updateAuraLockerRewardData(locker)
  // TODO
}

export function handleRewardPaid(event: RewardPaid): void {
  let locker = getLocker(event.address)
  updateAuraLockerRewardData(locker)
  let account = getCvxLockerAccount(event.params._user)
  // TODO
}

export function handleShutdown(event: Shutdown): void {
  let locker = getLocker(event.address)
  // TODO
}

export function handleStaked(event: Staked): void {
  let locker = getLocker(event.address)
  let account = getCvxLockerAccount(event.params._user)
  // TODO
}

export function handleWithdrawn(event: Withdrawn): void {
  let locker = getLocker(event.address)
  let account = getCvxLockerAccount(event.params._user)
  // TODO
}
