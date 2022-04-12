import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  Account,
  PoolAccount,
  AuraLockerAccount,
  AuraLockerUserData,
  AuraLockerUserLock,
  Pool,
} from '../generated/schema'
import { AuraLocker } from '../generated/AuraLocker/AuraLocker'
import { BaseRewardPool } from '../generated/templates/BaseRewardPool/BaseRewardPool'
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
    poolAccount.rewards = BigInt.zero()
    poolAccount.rewardPerTokenPaid = BigInt.zero()
    poolAccount.save()
    return poolAccount as PoolAccount
  }

  return poolAccount as PoolAccount
}

export function updatePoolAccountRewards(
  poolAccount: PoolAccount,
  pool: Pool,
): void {
  let rewardPoolContract = BaseRewardPool.bind(
    Address.fromBytes(pool.rewardPool),
  )

  let address = Address.fromString(poolAccount.account)

  poolAccount.rewards = rewardPoolContract.rewards(address)
  poolAccount.rewardPerTokenPaid =
    rewardPoolContract.userRewardPerTokenPaid(address)
}

export function getAuraLockerAccount(address: Address): AuraLockerAccount {
  let account = getAccount(address)

  let id = account.id
  let auraLockerAccount = AuraLockerAccount.load(id)

  if (auraLockerAccount == null) {
    auraLockerAccount = new AuraLockerAccount(id)
    auraLockerAccount.account = account.id
    auraLockerAccount.balanceNextUnlockIndex = 0
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

  let lockedBalancesResult = contract.lockedBalances(address)
  for (let i = 0; i < lockedBalancesResult.value3.length; i++) {
    let lockedBalance = lockedBalancesResult.value3[i]
    let userLockId = auraLockerAccount.id + '.' + i.toString()
    let userLock = AuraLockerUserLock.load(userLockId)
    if (userLock == null) {
      userLock = new AuraLockerUserLock(userLockId)
      userLock.auraLockerAccount = auraLockerAccount.id
    }
    userLock.amount = lockedBalance.amount
    userLock.unlockTime = lockedBalance.unlockTime.toI32()
    userLock.save()
  }

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
