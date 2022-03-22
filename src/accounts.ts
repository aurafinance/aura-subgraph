import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  Account,
  PoolAccount,
  CvxLockerAccount,
  CvxLockerUserData,
  CvxLockerUserLock,
  Pool,
} from '../generated/schema'
import { AuraLocker } from '../generated/templates/AuraLocker/AuraLocker'
import { BaseRewardPool } from '../generated/templates/BaseRewardPool/BaseRewardPool'

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
    poolAccount.rewards = BigInt.zero()
    poolAccount.rewardPerTokenPaid = BigInt.zero()
    poolAccount.save()
    return poolAccount as PoolAccount
  }

  return poolAccount as PoolAccount
}

export function updatePoolAccount(address: Address, pool: Pool): void {
  let contract = BaseRewardPool.bind(Address.fromBytes(pool.rewardPool))
  let poolAccount = getPoolAccount(address, pool)

  poolAccount.balance = contract.balanceOf(address)
  poolAccount.rewards = contract.rewards(address)
  poolAccount.rewardPerTokenPaid = contract.userRewardPerTokenPaid(address)

  poolAccount.save()
}

export function getCvxLockerAccount(address: Address): CvxLockerAccount {
  let account = getAccount(address)

  let id = account.id
  let cvxLockerAccount = CvxLockerAccount.load(id)

  if (cvxLockerAccount == null) {
    cvxLockerAccount = new CvxLockerAccount(id)
    cvxLockerAccount.account = account.id
    cvxLockerAccount.lastUpdateTime = 0
    cvxLockerAccount.rewardPerTokenPaid = BigInt.zero()
    cvxLockerAccount.periodFinish = 0
    cvxLockerAccount.balanceNextUnlockIndex = 0
    cvxLockerAccount.balanceLocked = BigInt.zero()
    cvxLockerAccount.rewardRate = BigInt.zero()
    cvxLockerAccount.save()
    return cvxLockerAccount as CvxLockerAccount
  }

  return cvxLockerAccount as CvxLockerAccount
}

export function updateCvxLockerAccount(
  address: Address,
  locker: Address,
): void {
  let contract = AuraLocker.bind(locker)
  let lockerAccount = getCvxLockerAccount(address)

  lockerAccount.balance = contract.balanceOf(address)

  // userData is not updated here; we can't iterate over unknown reward tokens

  let balances = contract.balances(address)
  lockerAccount.balanceLocked = balances.value0
  lockerAccount.balanceNextUnlockIndex = balances.value1.toI32()

  let lockedBalances = contract.lockedBalances(address)
  for (let i = 0; i++; i < lockedBalances.value3.length) {
    let lockedBalance = lockedBalances.value3[i]
  }

  lockerAccount.save()
}
