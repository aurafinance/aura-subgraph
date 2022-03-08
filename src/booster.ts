import { Address, BigInt, DataSourceContext } from "@graphprotocol/graph-ts"
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
  Withdrawn
} from "../generated/Booster/Booster"
import { Pool } from "../generated/schema"
import { BaseRewardPool, RewardFactory } from "../generated/templates"
import { adjustAccount } from "./accounts"
import { EIGHTEEN_DECIMALS, ZERO } from "./lib"

let ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export function handleArbitratorUpdated(event: ArbitratorUpdated): void {
}

export function handleFactoriesUpdated(event: FactoriesUpdated): void {
  if (event.params.rewardFactory !== ZERO_ADDRESS) {
    RewardFactory.create(event.params.rewardFactory)
  }
}

export function handleFeeInfoUpdated(event: FeeInfoUpdated): void {}

export function handleFeeManagerUpdated(event: FeeManagerUpdated): void {}

export function handleFeesUpdated(event: FeesUpdated): void {}

export function handleOwnerUpdated(event: OwnerUpdated): void {}

export function handlePoolAdded(event: PoolAdded): void {
  let pool = new Pool(event.params.pid.toString())

  pool.lpToken = event.params.lpToken;
  pool.token = event.params.token;
  pool.depositted = BigInt.fromI32(0).toBigDecimal()
  pool.staked = BigInt.fromI32(0).toBigDecimal()
  
  pool.save()
}

export function handlePoolManagerUpdated(event: PoolManagerUpdated): void {}

export function handlePoolShutdown(event: PoolShutdown): void {}

export function handleRewardContractsUpdated(
  event: RewardContractsUpdated
): void {
  let lockRewardsPool = new Pool('cvxCrv')
  lockRewardsPool.lpToken = ZERO_ADDRESS
  lockRewardsPool.token = ZERO_ADDRESS
  lockRewardsPool.depositted = BigInt.fromI32(0).toBigDecimal()
  lockRewardsPool.staked = BigInt.fromI32(0).toBigDecimal()
  lockRewardsPool.rewardPool = event.params.lockRewards

  let context = new DataSourceContext()
  context.setString('pid', 'cvxCrv')
  BaseRewardPool.createWithContext(event.params.lockRewards, context)

  lockRewardsPool.save()

  let stakerRewardsPool = new Pool('cvx')
  stakerRewardsPool.lpToken = ZERO_ADDRESS
  stakerRewardsPool.token = ZERO_ADDRESS
  stakerRewardsPool.depositted = BigInt.fromI32(0).toBigDecimal()
  stakerRewardsPool.staked = BigInt.fromI32(0).toBigDecimal()
  stakerRewardsPool.rewardPool = event.params.stakerRewards

  let context2 = new DataSourceContext()
  context2.setString('pid', 'cvx')
  BaseRewardPool.createWithContext(event.params.stakerRewards, context2)

  stakerRewardsPool.save()
}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {}

export function handleVoteDelegateUpdated(event: VoteDelegateUpdated): void {}

export function handleDeposited(event: Deposited): void {
  let amount = event.params.amount.divDecimal(EIGHTEEN_DECIMALS)

  let pool = Pool.load(event.params.poolid.toString())!
  pool.depositted = pool.depositted.plus(amount)

  adjustAccount(event.params.poolid.toString(), event.params.user, ZERO.toBigDecimal(), amount)

  pool.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let amount = event.params.amount.divDecimal(EIGHTEEN_DECIMALS)

  let pool = Pool.load(event.params.poolid.toString())!
  pool.depositted = pool.depositted.minus(amount)

  adjustAccount(event.params.poolid.toString(), event.params.user, ZERO.toBigDecimal(), amount.neg())

  pool.save()
}
