import { Address, log } from '@graphprotocol/graph-ts'

import { PoolRewardData, Pool, AuraLocker } from '../generated/schema'
import { AuraLocker as AuraLockerContract } from '../generated/templates/AuraLocker/AuraLocker'
import { BaseRewardPool } from '../generated/templates/BaseRewardPool/BaseRewardPool'
import { getToken } from './tokens'

export function updatePoolRewardData(pool: Pool): void {
  let contract = BaseRewardPool.bind(Address.fromBytes(pool.rewardPool))
  let rewardToken = contract.try_rewardToken()
  if (rewardToken.reverted) return

  let token = getToken(rewardToken.value)

  let id = pool.id + '.' + token.id
  let rewardData = new PoolRewardData(id)

  rewardData.token = token.id
  rewardData.pool = pool.id
  rewardData.rewardPerTokenStored = contract.rewardPerTokenStored()
  rewardData.rewardRate = contract.rewardRate()
  rewardData.lastUpdateTime = contract.lastUpdateTime().toI32()
  rewardData.periodFinish = contract.periodFinish().toI32()

  rewardData.save()
}
