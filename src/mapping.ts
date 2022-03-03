import { BigInt } from "@graphprotocol/graph-ts"
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

export function handleArbitratorUpdated(event: ArbitratorUpdated): void {
}

export function handleDeposited(event: Deposited): void {}

export function handleFactoriesUpdated(event: FactoriesUpdated): void {}

export function handleFeeInfoUpdated(event: FeeInfoUpdated): void {}

export function handleFeeManagerUpdated(event: FeeManagerUpdated): void {}

export function handleFeesUpdated(event: FeesUpdated): void {}

export function handleOwnerUpdated(event: OwnerUpdated): void {}

export function handlePoolAdded(event: PoolAdded): void {
  let pool = new Pool(event.params.pid.toString())

  pool.lpToken = event.params.lpToken;
  pool.staked = BigInt.fromI32(0).toBigDecimal()
  
  pool.save()
}

export function handlePoolManagerUpdated(event: PoolManagerUpdated): void {}

export function handlePoolShutdown(event: PoolShutdown): void {}

export function handleRewardContractsUpdated(
  event: RewardContractsUpdated
): void {}

export function handleTreasuryUpdated(event: TreasuryUpdated): void {}

export function handleVoteDelegateUpdated(event: VoteDelegateUpdated): void {}

export function handleWithdrawn(event: Withdrawn): void {}
