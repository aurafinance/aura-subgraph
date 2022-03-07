import { DataSourceContext, dataSource } from "@graphprotocol/graph-ts"
import { RewardPoolCreated } from "../generated/templates/RewardFactory/RewardFactory"
import { Staked, Withdrawn } from "../generated/templates/BaseRewardPool/BaseRewardPool"
import { Pool } from "../generated/schema"
import { BaseRewardPool } from "../generated/templates"
import { EIGHTEEN_DECIMALS, ZERO } from "./lib"
import { adjustAccount } from "./accounts"

export function handleRewardPoolCreated(event: RewardPoolCreated): void {
  let context = new DataSourceContext()
  context.setString('pid', event.params.pid.toString())
  BaseRewardPool.createWithContext(event.params.rewardPool, context)
}

export function handleDeposit(event: Staked): void {
  let context = dataSource.context()
  let pid = context.getString('pid')

  let amount = event.params.amount.divDecimal(EIGHTEEN_DECIMALS)

  let pool = Pool.load(pid)!
  pool.depositted = pool.depositted.minus(amount)

  adjustAccount(pid, event.params.user, amount, ZERO.toBigDecimal())

  pool.save()
}

export function handleWithdrawal(event: Withdrawn): void {
  let context = dataSource.context()
  let pid = context.getString('pid')

  let amount = event.params.amount.divDecimal(EIGHTEEN_DECIMALS)

  let pool = Pool.load(pid)!
  pool.depositted = pool.depositted.minus(amount)

  adjustAccount(pid, event.params.user, amount.neg(), ZERO.toBigDecimal())

  pool.save()
}
