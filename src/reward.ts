import { DataSourceContext, dataSource } from "@graphprotocol/graph-ts"
import { RewardPoolCreated } from "../generated/templates/RewardFactory/RewardFactory"
import { Staked, Withdrawn } from "../generated/templates/BaseRewardPool/BaseRewardPool"
import { Pool } from "../generated/schema"
import { BaseRewardPool } from "../generated/templates"
import { EIGHTEEN_DECIMALS } from "./lib"

export function handleRewardPoolCreated(event: RewardPoolCreated): void {
  let context = new DataSourceContext()
  context.setBigInt('pid', event.params.pid)
  BaseRewardPool.createWithContext(event.params.rewardPool, context)
}

export function handleDeposit(event: Staked): void {
  let context = dataSource.context()
  let pid = context.getBigInt('pid')

  let pool = Pool.load(pid.toString())!
  pool.depositted = pool.depositted.minus(event.params.amount.divDecimal(EIGHTEEN_DECIMALS))
  pool.save()
}

export function handleWithdrawal(event: Withdrawn): void {
  let context = dataSource.context()
  let pid = context.getBigInt('pid')

  let pool = Pool.load(pid.toString())!
  pool.depositted = pool.depositted.minus(event.params.amount.divDecimal(EIGHTEEN_DECIMALS))
  pool.save()
}