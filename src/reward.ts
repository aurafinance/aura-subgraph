import { DataSourceContext, dataSource, Address } from '@graphprotocol/graph-ts'
import { RewardPoolCreated } from '../generated/templates/RewardFactory/RewardFactory'
import {
  BaseRewardPool as BaseRewardPoolContrace,
  Staked,
  Withdrawn,
} from '../generated/templates/BaseRewardPool/BaseRewardPool'
import { Pool } from '../generated/schema'
import { BaseRewardPool } from '../generated/templates'
import { EIGHTEEN_DECIMALS, ZERO } from './lib'
import { adjustAccount } from './accounts'

function updateRewards(pool: Pool, rewardPoolAddress: Address): void {
  let poolContract = BaseRewardPoolContrace.bind(rewardPoolAddress)
  pool.rewardsLastUpdated = poolContract.lastUpdateTime().toI32()
  pool.rewardPerTokenStored = poolContract.rewardPerTokenStored()
}

export function handleRewardPoolCreated(event: RewardPoolCreated): void {
  let context = new DataSourceContext()
  context.setString('pid', event.params.pid.toString())
  BaseRewardPool.createWithContext(event.params.rewardPool, context)

  let pool = Pool.load(event.params.pid.toString())
  if (pool) {
    pool.rewardPool = event.params.rewardPool
    updateRewards(pool, event.params.rewardPool)
    pool.save()
  }
}

export function handleDeposit(event: Staked): void {
  let context = dataSource.context()
  let pid = context.getString('pid')

  let amount = event.params.amount.divDecimal(EIGHTEEN_DECIMALS)

  let pool = Pool.load(pid)!
  pool.staked = pool.staked.plus(amount)
  updateRewards(pool, event.address)

  if (!pool.rewardPool) {
    pool.rewardPool = event.address
  }

  adjustAccount(
    pid,
    event.params.user,
    amount,
    ZERO.toBigDecimal(),
    event.address,
    event.block.timestamp.toI32(),
  )

  pool.save()
}

export function handleWithdrawal(event: Withdrawn): void {
  let context = dataSource.context()
  let pid = context.getString('pid')

  let amount = event.params.amount.divDecimal(EIGHTEEN_DECIMALS)

  let pool = Pool.load(pid)!
  pool.staked = pool.staked.minus(amount)
  updateRewards(pool, event.address)

  if (!pool.rewardPool) {
    pool.rewardPool = event.address
  }

  adjustAccount(
    pid,
    event.params.user,
    amount.neg(),
    ZERO.toBigDecimal(),
    event.address,
    event.block.timestamp.toI32(),
  )

  pool.save()
}
