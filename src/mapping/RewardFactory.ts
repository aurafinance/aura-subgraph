import { Address, BigDecimal, DataSourceContext } from '@graphprotocol/graph-ts'
import {
  ArbitratorUpdated,
  Deposited,
  FactoriesUpdated,
  FeeInfoUpdated,
  FeeManagerUpdated,
  FeesUpdated,
  OwnerUpdated,
  PoolAdded,
  PoolManagerUpdated,
  PoolShutdown,
  RewardContractsUpdated,
  TreasuryUpdated,
  VoteDelegateUpdated,
  Withdrawn,
} from '../../generated/Booster/Booster'
import { CvxCrvPool, CvxPool, FactoryPool } from '../../generated/schema'
import { BaseRewardPool, RewardFactory } from '../../generated/templates'
import { BaseRewardPool as BaseRewardPoolContract } from '../../generated/templates/BaseRewardPool/BaseRewardPool'
import { CvxStakingProxy } from '../../generated/Booster/CvxStakingProxy'
import { adjustAccount } from '../accounts'
import { SCALE } from '../lib'
import { getToken } from '../token'

export function handleArbitratorUpdated(event: ArbitratorUpdated): void {}

export function handleFactoriesUpdated(event: FactoriesUpdated): void {
  if (event.params.rewardFactory != Address.zero()) {
    RewardFactory.create(event.params.rewardFactory)
  }
}

export function handleFeeInfoUpdated(event: FeeInfoUpdated): void {}

export function handleFeeManagerUpdated(event: FeeManagerUpdated): void {}

export function handleFeesUpdated(event: FeesUpdated): void {}

export function handleOwnerUpdated(event: OwnerUpdated): void {}

export function handlePoolAdded(event: PoolAdded): void {
  let pool = new FactoryPool(event.params.pid.toString())

  pool.lpToken = getToken(event.params.lpToken).id
  pool.depositToken = getToken(event.params.token).id
  pool.isShutdown = false
  pool.gauge = event.params.gauge
  pool.stash = event.params.stash
  // pool.rewardsLastUpdated = 0
  // pool.rewardPerTokenStored = BigInt.zero()

  pool.save()
}

export function handlePoolManagerUpdated(event: PoolManagerUpdated): void {}

export function handlePoolShutdown(event: PoolShutdown): void {}

export function handleRewardContractsUpdated(
  event: RewardContractsUpdated,
): void {
  {
    let cvxCrvRewardContract = BaseRewardPoolContract.bind(
      event.params.lockRewards,
    )
    let pool = new CvxCrvPool('cvxCrv')

    pool.depositToken = getToken(cvxCrvRewardContract.stakingToken()).id
    pool.rewardsPool = event.params.lockRewards
    // pool.rewardsLastUpdated = 0
    // pool.rewardPerTokenStored = BigInt.zero()
    pool.save()
  }

  {
    let context = new DataSourceContext()
    context.setString('pid', 'cvxCrv')
    BaseRewardPool.createWithContext(event.params.lockRewards, context)
  }

  {
    let cvxRewardContract = CvxStakingProxy.bind(event.params.stakerRewards)
    let pool = new CvxPool('cvx')

    pool.depositToken = getToken(cvxRewardContract.cvx()).id
    pool.rewardsPool = event.params.stakerRewards
    // pool.rewardsLastUpdated = 0
    // pool.rewardPerTokenStored = BigInt.zero()
    pool.save()
  }

  {
    let context = new DataSourceContext()
    context.setString('pid', 'cvx')
    BaseRewardPool.createWithContext(event.params.stakerRewards, context)
  }
}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {}

export function handleVoteDelegateUpdated(event: VoteDelegateUpdated): void {}

export function handleDeposited(event: Deposited): void {
  let amount = event.params.amount.divDecimal(SCALE)

  let pool = FactoryPool.load(event.params.poolid.toString())!
  pool.save()

  adjustAccount(
    event.params.poolid.toString(),
    event.params.user,
    BigDecimal.zero(),
    amount,
  )
}

export function handleWithdrawn(event: Withdrawn): void {
  let amount = event.params.amount.divDecimal(SCALE)

  let pool = FactoryPool.load(event.params.poolid.toString())!

  adjustAccount(
    event.params.poolid.toString(),
    event.params.user,
    BigDecimal.zero(),
    amount.neg(),
  )

  pool.save()
}
