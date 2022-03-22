import { dataSource } from '@graphprotocol/graph-ts'

import {
  Staked,
  Withdrawn,
  RewardAdded,
  RewardPaid,
} from '../../generated/templates/BaseRewardPool/BaseRewardPool'
import { Pool } from '../../generated/schema'
import { updatePoolAccount } from '../accounts'
import { updatePoolRewardData } from '../rewards'

export function handleStaked(event: Staked): void {
  let context = dataSource.context()
  let pid = context.getString('pid')
  let pool = Pool.load(pid)!

  updatePoolRewardData(pool)

  updatePoolAccount(event.params.user, pool)

  pool.totalSupply = pool.totalSupply.plus(event.params.amount)
  pool.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let context = dataSource.context()
  let pid = context.getString('pid')
  let pool = Pool.load(pid)!

  updatePoolRewardData(pool)

  updatePoolAccount(event.params.user, pool)

  pool.totalSupply = pool.totalSupply.minus(event.params.amount)
  pool.save()
}

export function handleRewardAdded(event: RewardAdded): void {
  let context = dataSource.context()
  let pid = context.getString('pid')
  let pool = Pool.load(pid)!

  updatePoolRewardData(pool)

  pool.save()
}

export function handleRewardPaid(event: RewardPaid): void {
  let context = dataSource.context()
  let pid = context.getString('pid')
  let pool = Pool.load(pid)!

  updatePoolRewardData(pool)

  updatePoolAccount(event.params.user, pool)

  pool.save()
}
