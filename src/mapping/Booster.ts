import { Address, BigInt, DataSourceContext } from '@graphprotocol/graph-ts'

import {
  Booster,
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
import { BaseRewardPool as BaseRewardPoolContract } from '../../generated/Booster/BaseRewardPool'
import { RewardFactory, BaseRewardPool } from '../../generated/templates'
import { FactoryPoolData, Global, Pool } from '../../generated/schema'

import { getToken } from '../tokens'
import { updatePoolRewardData } from '../rewards'
import { getPoolAccount } from '../accounts'

export function handleArbitratorUpdated(event: ArbitratorUpdated): void {
  // TODO
}

export function handleDeposited(event: Deposited): void {
  let poolId = event.params.poolid.toString()
  let pool = Pool.load(poolId)!
  pool.totalSupply = pool.totalSupply.plus(event.params.amount)
  pool.save()

  let poolAccount = getPoolAccount(event.params.user, pool)
  poolAccount.balance = poolAccount.balance.plus(event.params.amount)
  poolAccount.save()
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
  factoryPoolData.isShutdown = false
  factoryPoolData.gauge = event.params.gauge
  factoryPoolData.stash = event.params.stash
  factoryPoolData.save()

  pool.isFactoryPool = true
  pool.lpToken = getToken(event.params.lpToken).id
  pool.depositToken = getToken(event.params.token).id
  pool.totalSupply = BigInt.zero()
  pool.totalStaked = BigInt.zero()
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
    let boosterContract = Booster.bind(event.address)

    let pool = new Pool('auraBal')

    pool.isFactoryPool = false
    pool.lpToken = getToken(boosterContract.crv()).id // BAL
    pool.depositToken = getToken(auraBalRewardContract.stakingToken()).id // auraBAL
    pool.rewardPool = event.params.lockRewards
    pool.totalSupply = BigInt.zero()
    pool.totalStaked = BigInt.zero()
    updatePoolRewardData(pool)
    pool.save()

    let context = new DataSourceContext()
    context.setString('pid', 'auraBal')
    BaseRewardPool.createWithContext(event.params.lockRewards, context)

    {
      let global = new Global('global')
      global.auraTotalCliffs = BigInt.zero()
      global.auraReductionPerCliff = BigInt.zero()
      global.auraMaxSupply = BigInt.zero()
      global.save()
    }
  }
}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {
  // TODO
}

export function handleVoteDelegateUpdated(event: VoteDelegateUpdated): void {
  // TODO
}

export function handleWithdrawn(event: Withdrawn): void {
  let poolId = event.params.poolid.toString()
  let pool = Pool.load(poolId)!
  pool.totalSupply = pool.totalSupply.minus(event.params.amount)
  pool.save()

  let poolAccount = getPoolAccount(event.params.user, pool)
  poolAccount.balance = poolAccount.balance.minus(event.params.amount)
  poolAccount.save()
}
