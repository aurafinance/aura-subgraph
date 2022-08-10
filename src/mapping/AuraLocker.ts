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
import { getAuraLockerAccount, updateAuraLockerAccount } from '../accounts'
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
  let lockerAccount = getAuraLockerAccount(event.params.delegator)
  lockerAccount.delegate = getAuraLockerAccount(event.params.toDelegate).id
  lockerAccount.delegateUpdatedAt = event.block.timestamp.toI32()
  lockerAccount.save()

  updateAuraLockerAccount(event.params.delegator, event.address)

  if (event.params.fromDelegate.notEqual(event.params.delegator)) {
    updateAuraLockerAccount(event.params.fromDelegate, event.address)
  }

  if (event.params.toDelegate.notEqual(event.params.delegator)) {
    updateAuraLockerAccount(event.params.toDelegate, event.address)
  }
}

export function handleDelegateCheckpointed(event: DelegateCheckpointed): void {
  getLocker(event.address)
}

export function handleKickIncentiveSet(event: KickIncentiveSet): void {
  getLocker(event.address)
}

export function handleKickReward(event: KickReward): void {
  getLocker(event.address)
  updateAuraLockerAccount(event.params._user, event.address)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  getLocker(event.address)
}

export function handleRecovered(event: Recovered): void {
  getLocker(event.address)
}

export function handleRewardAdded(event: RewardAdded): void {
  let locker = getLocker(event.address)
  updateAuraLockerRewardData(locker, event.params._token)
}

export function handleRewardPaid(event: RewardPaid): void {
  let locker = getLocker(event.address)
  updateAuraLockerRewardData(locker, event.params._rewardsToken)
  updateAuraLockerAccount(event.params._user, event.address)
}

export function handleShutdown(event: Shutdown): void {
  getLocker(event.address)
}

export function handleStaked(event: Staked): void {
  let locker = getLocker(event.address)
  updateAuraLockerAccount(event.params._user, event.address)
  updateLocker(locker)
  locker.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let locker = getLocker(event.address)
  updateAuraLockerAccount(event.params._user, event.address)
  updateLocker(locker)
  locker.save()
}
