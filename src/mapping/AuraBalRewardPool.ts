import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  Staked,
  Withdrawn,
  RewardAdded,
  RewardPaid,
  AuraBalRewardPool,
} from '../../generated/AuraBalRewardPool/AuraBalRewardPool'
import { Pool } from '../../generated/schema'
import { getPoolAccount, updatePoolAccountRewards } from '../accounts'
import { updatePoolRewardData } from '../rewards'
import { getToken } from '../tokens'

function getAuraBalPool(address: Address): Pool {
  let id = 'initialAuraBalRewards'

  let pool = Pool.load(id)

  if (pool == null) {
    pool = new Pool(id)
    let contract = AuraBalRewardPool.bind(address)
    pool.totalStaked = BigInt.zero()
    pool.totalSupply = contract.totalSupply()
    pool.rewardPool = address
    pool.lpToken = getToken(contract.stakingToken()).id
    pool.depositToken = getToken(contract.stakingToken()).id
    pool.isFactoryPool = false
    pool.startTime = contract.startTime().toI32()
    pool.save()
  }

  return pool as Pool
}

export function handleStaked(event: Staked): void {
  let pool = getAuraBalPool(event.address)
  updatePoolRewardData(pool)
  pool.totalStaked = pool.totalStaked.plus(event.params.amount)
  pool.save()

  let poolAccount = getPoolAccount(event.params.user, pool)
  updatePoolAccountRewards(poolAccount, pool)
  poolAccount.staked = poolAccount.staked.plus(event.params.amount)
  poolAccount.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let pool = getAuraBalPool(event.address)
  updatePoolRewardData(pool)
  pool.totalStaked = pool.totalStaked.minus(event.params.amount)
  pool.save()

  let poolAccount = getPoolAccount(event.params.user, pool)
  updatePoolAccountRewards(poolAccount, pool)
  poolAccount.staked = poolAccount.staked.minus(event.params.amount)
  poolAccount.save()
}

export function handleRewardAdded(event: RewardAdded): void {
  let pool = getAuraBalPool(event.address)
  updatePoolRewardData(pool)
  pool.save()
}

export function handleRewardPaid(event: RewardPaid): void {
  let pool = getAuraBalPool(event.address)
  updatePoolRewardData(pool)
  pool.save()

  let poolAccount = getPoolAccount(event.params.user, pool)
  updatePoolAccountRewards(poolAccount, pool)
  poolAccount.save()
}
