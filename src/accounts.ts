import { Address, BigInt, store } from '@graphprotocol/graph-ts'

import {
  Account,
  PoolAccount,
  AuraLockerAccount,
  AuraLockerUserData,
  AuraLockerUserLock,
  Pool,
  PoolAccountRewards,
} from '../generated/schema'
import { AuraLocker } from '../generated/AuraLocker/AuraLocker'
import { BaseRewardPool } from '../generated/templates/BaseRewardPool/BaseRewardPool'
import { VirtualBalanceRewardPool } from '../generated/Booster/VirtualBalanceRewardPool'
import { getToken } from './tokens'

export function getAccount(address: Address): Account {
  let id = address.toHexString()
  let account = Account.load(id)

  if (account == null) {
    account = new Account(id)
    account.save()
    return account as Account
  }

  return account as Account
}

export function getPoolAccount(address: Address, pool: Pool): PoolAccount {
  let account = getAccount(address)

  let id = pool.id + '.' + account.id
  let poolAccount = PoolAccount.load(id)

  if (poolAccount == null) {
    poolAccount = new PoolAccount(id)
    poolAccount.account = account.id
    poolAccount.pool = pool.id
    poolAccount.balance = BigInt.zero()
    poolAccount.staked = BigInt.zero()
    poolAccount.save()
    return poolAccount as PoolAccount
  }

  return poolAccount as PoolAccount
}

export function updatePoolAccountRewards(
  poolAccount: PoolAccount,
  pool: Pool,
): void {
  let contract = BaseRewardPool.bind(Address.fromBytes(pool.rewardPool))

  let address = Address.fromString(poolAccount.account)

  {
    let rewardsToken = getToken(contract.rewardToken())
    let id = rewardsToken.id + '.' + poolAccount.id
    let poolAccountRewards = new PoolAccountRewards(id)
    poolAccountRewards.poolAccount = poolAccount.id
    poolAccountRewards.rewardToken = rewardsToken.id
    poolAccountRewards.rewards = contract.rewards(address)
    poolAccountRewards.rewardPerTokenPaid =
      contract.userRewardPerTokenPaid(address)
    poolAccountRewards.save()
  }

  let extraRewardsLength = contract.try_extraRewardsLength()
  if (!extraRewardsLength.reverted) {
    for (let i = 0; i < extraRewardsLength.value.toI32(); i++) {
      let extraRewardsAddress = contract.extraRewards(BigInt.fromI32(i))
      if (extraRewardsAddress.notEqual(Address.zero())) {
        let extraRewardsContract =
          VirtualBalanceRewardPool.bind(extraRewardsAddress)

        let rewardsToken = getToken(extraRewardsContract.rewardToken())

        // Assuming that rewardsTokens won't be duplicated across rewards/extraRewards for one pool
        let id = rewardsToken.id + '.' + poolAccount.id
        let poolAccountRewards = new PoolAccountRewards(id)
        poolAccountRewards.poolAccount = poolAccount.id
        poolAccountRewards.rewardToken = rewardsToken.id
        poolAccountRewards.rewards = extraRewardsContract.rewards(address)
        poolAccountRewards.rewardPerTokenPaid =
          extraRewardsContract.userRewardPerTokenPaid(address)
        poolAccountRewards.save()
      }
    }
  }
}

export function getAuraLockerAccount(address: Address): AuraLockerAccount {
  let account = getAccount(address)

  let id = account.id
  let auraLockerAccount = AuraLockerAccount.load(id)

  if (auraLockerAccount == null) {
    auraLockerAccount = new AuraLockerAccount(id)

    auraLockerAccount.account = id
    auraLockerAccount.auraLocker = 'auraLocker'
    auraLockerAccount.balanceNextUnlockIndex = 0
    auraLockerAccount.balance = BigInt.zero()
    auraLockerAccount.userLocksLength = 0
    auraLockerAccount.balanceLocked = BigInt.zero()
    auraLockerAccount.save()
    return auraLockerAccount as AuraLockerAccount
  }

  return auraLockerAccount as AuraLockerAccount
}

export function updateAuraLockerAccount(
  address: Address,
  locker: Address,
): void {
  let contract = AuraLocker.bind(locker)
  let auraLockerAccount = getAuraLockerAccount(address)

  auraLockerAccount.balance = contract.balanceOf(address)
  auraLockerAccount.auraLocker = 'auraLocker'

  let balancesResult = contract.balances(address)
  auraLockerAccount.balanceLocked = balancesResult.value0
  auraLockerAccount.balanceNextUnlockIndex = balancesResult.value1.toI32()

  // Remove all previous locks for this account, then save the current state.
  // Given that the array can be shorter after re-locking, this ensures that
  // there will be no stale user locks after the update.
  for (let i = 0; i < auraLockerAccount.userLocksLength; i++) {
    let userLockId = auraLockerAccount.id + '.' + i.toString()
    store.remove('AuraLockerUserLock', userLockId)
  }

  // Iterate through userLocks (the function is called with an index)
  let userLocksLength = 0
  for (let i = 0; i < 255; i++) {
    let userLocksCall = contract.try_userLocks(address, BigInt.fromI32(i))

    if (userLocksCall.reverted) {
      userLocksLength = i
      break
    }

    let amount = userLocksCall.value.getAmount()
    let unlockTime = userLocksCall.value.getUnlockTime()

    let userLockId = auraLockerAccount.id + '.' + i.toString()
    let userLock = AuraLockerUserLock.load(userLockId)
    if (userLock == null) {
      userLock = new AuraLockerUserLock(userLockId)
      userLock.auraLockerAccount = auraLockerAccount.id
    }
    userLock.amount = amount
    userLock.unlockTime = unlockTime.toI32()
    userLock.save()
  }

  auraLockerAccount.userLocksLength = userLocksLength
  auraLockerAccount.save()

  for (let i = 0; i < 255; i++) {
    let rewardTokenResult = contract.try_rewardTokens(BigInt.fromI32(i))

    if (
      rewardTokenResult.reverted ||
      rewardTokenResult.value == Address.zero()
    ) {
      break
    }

    let userDataResult = contract.userData(address, rewardTokenResult.value)

    let rewardToken = getToken(rewardTokenResult.value)

    let userDataId = auraLockerAccount.id + '.' + rewardToken.id
    let userData = AuraLockerUserData.load(userDataId)

    if (userData == null) {
      userData = new AuraLockerUserData(userDataId)
      userData.auraLockerAccount = auraLockerAccount.id
      userData.token = rewardToken.id
    }

    userData.rewardPerTokenPaid = userDataResult.value0
    userData.rewards = userDataResult.value1

    userData.save()
  }
}
