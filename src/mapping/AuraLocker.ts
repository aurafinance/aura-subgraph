import { Address, BigInt } from '@graphprotocol/graph-ts'

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
  AuraLocker as AuraLockerContract,
} from '../../generated/AuraLocker/AuraLocker'
import { AuraLocker, AuraLockerRewardData } from '../../generated/schema'
import { updateAuraLockerAccount } from '../accounts'
import { getToken } from '../tokens'

function getLocker(address: Address): AuraLocker {
  let id = 'auraLocker'
  let locker = AuraLocker.load(id)

  if (locker == null) {
    let contract = AuraLockerContract.bind(Address.fromBytes(address))
    getToken(contract.stakingToken())

    locker = new AuraLocker(id)
    locker.address = address
    locker.lockedSupply = BigInt.zero()
    locker.totalSupply = BigInt.zero()
    locker.save()
    return locker as AuraLocker
  }

  return locker as AuraLocker
}

function updateLocker(locker: AuraLocker): void {
  let contract = AuraLockerContract.bind(Address.fromBytes(locker.address))
  locker.lockedSupply = contract.lockedSupply()
  locker.totalSupply = contract.totalSupply()
}

function updateAuraLockerRewardData(
  locker: AuraLocker,
  rewardsTokenAddress: Address,
): void {
  let contract = AuraLockerContract.bind(Address.fromBytes(locker.address))

  let rewardsToken = getToken(rewardsTokenAddress)

  let rewardData = AuraLockerRewardData.load(rewardsToken.id)

  if (rewardData == null) {
    rewardData = new AuraLockerRewardData(rewardsToken.id)
    rewardData.token = rewardsToken.id
    rewardData.auraLocker = locker.id
  }

  let rewardDataResult = contract.rewardData(rewardsTokenAddress)
  rewardData.periodFinish = rewardDataResult.value0.toI32()
  rewardData.lastUpdateTime = rewardDataResult.value1.toI32()
  rewardData.rewardRate = rewardDataResult.value2
  rewardData.rewardPerTokenStored = rewardDataResult.value3
  rewardData.save()
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
  updateAuraLockerAccount(event.params._user, event.address)
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
  updateAuraLockerRewardData(locker, event.params._token)
  // TODO
}

export function handleRewardPaid(event: RewardPaid): void {
  let locker = getLocker(event.address)
  updateAuraLockerRewardData(locker, event.params._rewardsToken)
  updateAuraLockerAccount(event.params._user, event.address)
  // TODO
}

export function handleShutdown(event: Shutdown): void {
  let locker = getLocker(event.address)
  // TODO
}

export function handleStaked(event: Staked): void {
  let locker = getLocker(event.address)
  updateAuraLockerAccount(event.params._user, event.address)
  updateLocker(locker)
  locker.save()
  // TODO
}

export function handleWithdrawn(event: Withdrawn): void {
  let locker = getLocker(event.address)
  updateAuraLockerAccount(event.params._user, event.address)
  updateLocker(locker)
  locker.save()
  // TODO
}
