import {
  DataSourceContext,
  dataSource,
  Address,
  BigDecimal,
  log,
} from '@graphprotocol/graph-ts'
import { RewardPoolCreated } from '../../generated/templates/RewardFactory/RewardFactory'
import {
  BaseRewardPool as BaseRewardPoolContrace,
  Staked,
  Withdrawn,
} from '../../generated/templates/BaseRewardPool/BaseRewardPool'
import { Pool } from '../../generated/schema'
import { BaseRewardPool } from '../../generated/templates'
import { SCALE } from '../lib'
import { adjustAccount } from '../accounts'

function updateRewards(pool: Pool, rewardPoolAddress: Address): void {
  let poolContract = BaseRewardPoolContrace.bind(rewardPoolAddress)
  pool.rewardsLastUpdated = poolContract.lastUpdateTime().toI32()
  pool.rewardPerTokenStored = poolContract.rewardPerTokenStored()
  log.debug('updateRewards pool.id {} RPTS {}', [
    pool.id,
    pool.rewardPerTokenStored.toString(),
  ])
}

export function handleRewardPoolCreated(event: RewardPoolCreated): void {
  let context = new DataSourceContext()
  context.setString('pid', event.params._pid.toString())
  BaseRewardPool.createWithContext(event.params.rewardPool, context)

  let pool = Pool.load(event.params._pid.toString())
  if (pool != null) {
    pool.rewardPool = event.params.rewardPool
    updateRewards(pool, event.params.rewardPool)
    pool.save()
  }
}

export function handleStaked(event: Staked): void {
  let context = dataSource.context()
  let pid = context.getString('pid')

  let amount = event.params.amount.divDecimal(SCALE)

  let pool = Pool.load(pid)!
  pool.staked = pool.staked.plus(amount)
  log.debug('handleStaked pid {} staked {}', [pid, pool.staked.toString()])
  updateRewards(pool, event.address)
  pool.save()

  // FIXME shouldn't be needed?
  // if (!pool.rewardPool) {
  //   pool.rewardPool = event.address
  // }

  adjustAccount(
    pid,
    event.params.user,
    amount,
    BigDecimal.zero(),
    event.address,
    event.block.timestamp.toI32(),
  )
}

export function handleWithdrawn(event: Withdrawn): void {
  let context = dataSource.context()
  let pid = context.getString('pid')

  let amount = event.params.amount.divDecimal(SCALE)

  let pool = Pool.load(pid)!
  pool.staked = pool.staked.minus(amount)
  log.debug('handleWithdrawn pid {} staked {}', [pid, pool.staked.toString()])
  updateRewards(pool, event.address)
  pool.save()

  // FIXME shouldn't be needed?
  // if (pool.rewardPool) {
  //   pool.rewardPool = event.address
  // }

  adjustAccount(
    pid,
    event.params.user,
    amount.neg(),
    BigDecimal.zero(),
    event.address,
    event.block.timestamp.toI32(),
  )
}
