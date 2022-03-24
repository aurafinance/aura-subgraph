import { dataSource } from '@graphprotocol/graph-ts'

import {
  Staked,
  Withdrawn,
  RewardAdded,
  RewardPaid,
} from '../../generated/templates/BaseRewardPool/BaseRewardPool'
import { Pool } from '../../generated/schema'
import { getPoolAccount, updatePoolAccountRewards } from '../accounts'
import { updatePoolRewardData } from '../rewards'

function getPoolFromPid(): Pool {
  let context = dataSource.context()
  let pid = context.getString('pid')
  return Pool.load(pid)!
}

export function handleStaked(event: Staked): void {
  let pool = getPoolFromPid()
  updatePoolRewardData(pool)
  pool.totalStaked = pool.totalStaked.plus(event.params.amount)
  pool.save()

  let poolAccount = getPoolAccount(event.params.user, pool)
  updatePoolAccountRewards(poolAccount, pool)
  poolAccount.staked = poolAccount.staked.plus(event.params.amount)
  poolAccount.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let pool = getPoolFromPid()
  updatePoolRewardData(pool)
  pool.totalStaked = pool.totalStaked.minus(event.params.amount)
  pool.save()

  let poolAccount = getPoolAccount(event.params.user, pool)
  updatePoolAccountRewards(poolAccount, pool)
  poolAccount.staked = poolAccount.staked.minus(event.params.amount)
  poolAccount.save()
}

export function handleRewardAdded(event: RewardAdded): void {
  let pool = getPoolFromPid()
  updatePoolRewardData(pool)
  pool.save()
}

export function handleRewardPaid(event: RewardPaid): void {
  let pool = getPoolFromPid()
  updatePoolRewardData(pool)
  pool.save()

  let poolAccount = getPoolAccount(event.params.user, pool)
  updatePoolAccountRewards(poolAccount, pool)
  poolAccount.save()
}
