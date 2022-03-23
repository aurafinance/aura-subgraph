import { Address, BigInt, DataSourceContext } from '@graphprotocol/graph-ts'

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
import { CvxStakingProxy } from '../../generated/Booster/CvxStakingProxy'
import { BaseRewardPool as BaseRewardPoolContract } from '../../generated/Booster/BaseRewardPool'
import { RewardFactory, BaseRewardPool } from '../../generated/templates'
import { AuraBalPoolData, FactoryPoolData, Pool } from '../../generated/schema'

import { getToken } from '../tokens'
import { updatePoolRewardData } from '../rewards'

export function handleArbitratorUpdated(event: ArbitratorUpdated): void {
  // TODO
}

export function handleDeposited(event: Deposited): void {
  // TODO
}

export function handleFactoriesUpdated(event: FactoriesUpdated): void {
  if (event.params.rewardFactory != Address.zero()) {
    RewardFactory.create(event.params.rewardFactory)
  }
}

export function handleFeeInfoUpdated(event: FeeInfoUpdated): void {
  // TODO
}

export function handleFeeManagerUpdated(event: FeeManagerUpdated): void {
  // TODO
}

export function handleFeesUpdated(event: FeesUpdated): void {
  // TODO
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
  // TODO
}

export function handlePoolAdded(event: PoolAdded): void {
  let pool = new Pool(event.params.pid.toString())

  let factoryPoolData = new FactoryPoolData(pool.id)
  pool.factoryPoolData = factoryPoolData.id
  factoryPoolData.pool = pool.id
  factoryPoolData.lpToken = getToken(event.params.lpToken).id
  factoryPoolData.isShutdown = false
  factoryPoolData.gauge = event.params.gauge
  factoryPoolData.stash = event.params.stash
  factoryPoolData.save()

  pool.isFactoryPool = true
  pool.depositToken = getToken(event.params.token).id
  pool.totalSupply = BigInt.zero()
  pool.rewardPool = event.params.rewardPool
  updatePoolRewardData(pool)
  pool.save()
}

export function handlePoolManagerUpdated(event: PoolManagerUpdated): void {
  // TODO
}

export function handlePoolShutdown(event: PoolShutdown): void {
  let factoryData = new FactoryPoolData(event.params.poolId.toString())
  factoryData.isShutdown = true
  factoryData.save()
}

export function handleRewardContractsUpdated(
  event: RewardContractsUpdated,
): void {
  {
    let auraBalRewardContract = BaseRewardPoolContract.bind(
      event.params.lockRewards,
    )
    let pool = new Pool('auraBal')

    pool.isFactoryPool = false
    pool.depositToken = getToken(auraBalRewardContract.stakingToken()).id
    pool.rewardPool = event.params.lockRewards
    pool.totalSupply = BigInt.zero()
    updatePoolRewardData(pool)
    pool.save()

    let context = new DataSourceContext()
    context.setString('pid', 'auraBal')
    BaseRewardPool.createWithContext(event.params.lockRewards, context)

    {
      let poolData = new AuraBalPoolData(pool.id)
      poolData.pool = pool.id
      poolData.totalCliffs = BigInt.zero()
      poolData.reductionPerCliff = BigInt.zero()
      poolData.maxSupply = BigInt.zero()
      poolData.save()
    }
  }

  {
    let stakingProxy = CvxStakingProxy.bind(event.params.stakerRewards)
    let pool = new Pool('aura')

    pool.isFactoryPool = false
    pool.depositToken = getToken(stakingProxy.cvx()).id
    pool.rewardPool = event.params.stakerRewards
    pool.totalSupply = BigInt.zero()
    updatePoolRewardData(pool)
    pool.save()

    let context = new DataSourceContext()
    context.setString('pid', 'aura')
    BaseRewardPool.createWithContext(event.params.stakerRewards, context)
  }
}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {
  // TODO
}

export function handleVoteDelegateUpdated(event: VoteDelegateUpdated): void {
  // TODO
}

export function handleWithdrawn(event: Withdrawn): void {
  // TODO
}
